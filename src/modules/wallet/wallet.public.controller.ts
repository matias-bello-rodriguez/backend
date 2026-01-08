import {
  Controller,
  Post,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('Wallet Public')
@Controller('wallet/public')
export class WalletPublicController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit/transbank/return')
  @ApiOperation({ summary: 'Retorno de Webpay (Público)' })
  async webpayReturn(@Body() body, @Query() query, @Res() res) {
    const token = body.token_ws || query.token_ws;
    if (!token) {
      return res.status(400).send('Token not found');
    }

    try {
      const result = await this.walletService.confirmDepositByToken(token);
      if (result.success) {
        res.send(`
          <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;flex-direction:column;">
              <h1 style="color:green;">¡Pago Exitoso!</h1>
              <p>Tu saldo ha sido cargado.</p>
              <p>Puedes volver a la aplicación.</p>
            </body>
          </html>
        `);
      } else {
        res.send(`
          <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;flex-direction:column;">
              <h1 style="color:red;">Pago Fallido</h1>
              <p>No se pudo completar la transacción.</p>
              <p>Vuelve a intentarlo.</p>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error(error);
      res.send(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;flex-direction:column;">
            <h1 style="color:red;">Error</h1>
            <p>Ocurrió un error al procesar el pago.</p>
          </body>
        </html>
      `);
    }
  }
}
