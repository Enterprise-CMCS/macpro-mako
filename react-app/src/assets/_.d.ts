declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png";

declare module "*.pdf";

declare const __IS_FRONTEND__: boolean;
