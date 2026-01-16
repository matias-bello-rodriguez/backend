import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('Wallet Public')
@Controller('wallet/public')
export class WalletPublicController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit/transbank/return')
  @Get('deposit/transbank/return')
  @ApiOperation({ summary: 'Retorno de Webpay (Público)' })
  async webpayReturn(@Body() body, @Query() query, @Res() res, @Req() req) {
    console.log(`Webpay Return hit via ${req.method}`);
    const token = body?.token_ws || query?.token_ws;
    const tbkToken = body?.TBK_TOKEN || query?.TBK_TOKEN;
    const tbkOrdenCompra = body?.TBK_ORDEN_COMPRA || query?.TBK_ORDEN_COMPRA;
    
    // Si es una anulación (usuario canceló en Transbank)
    if (tbkToken && tbkOrdenCompra) {
        console.log('Pago anulado por usuario (TBK_TOKEN detectado)');
        return res.send(`
             <html>
               <body style="background:#fff;">
                 <script>window.location.href = 'autobox://payment-cancelled';</script>
               </body>
             </html>
        `);
    }

    if (!token) {
      return res.status(400).send('Token not found');
    }

    try {
      const result = await this.walletService.confirmDepositByToken(token);
      
      if (result.success) {
        res.send(`
          <html>
            <body style="background:#fff;">
              <script>window.location.href = 'autobox://payment-success?token=${token}';</script>
            </body>
          </html>
        `);
      } else {
        res.send(`
          <html>
            <body style="background:#fff;">
              <script>window.location.href = 'autobox://payment-cancelled?reason=failed';</script>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error(error);
      res.send(`
        <html>
          <body style="background:#fff;">
            <script>window.location.href = 'autobox://payment-cancelled?reason=error';</script>
          </body>
        </html>
      `);
    }
  }
}
