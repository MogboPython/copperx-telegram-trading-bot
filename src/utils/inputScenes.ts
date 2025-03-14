import { Scenes } from 'telegraf';
import { MyContext } from '../types/context';
import { AUTH_SCENES } from '../constants/authConstants';
import { authHandler } from '../handlers/authHandler';

// Email input scene
export const emailInputScene = new Scenes.BaseScene<MyContext>(AUTH_SCENES.EMAIL_INPUT);
emailInputScene.on('text', async (ctx) => {
  await authHandler.handleEmailInput(ctx);
});

// OTP input scene
export const otpInputScene = new Scenes.BaseScene<MyContext>(AUTH_SCENES.OTP_INPUT);
otpInputScene.on('text', async (ctx) => {
  await authHandler.handleOtpInput(ctx);
});