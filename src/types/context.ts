import { Context, Scenes } from 'telegraf';

export interface MyContext extends Context {
  scene: Scenes.SceneContextScene<any>;
  session: any;
}