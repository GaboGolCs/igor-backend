// DTO alineado con nuestro contrato OpenAPI (pushtokens_body)
export interface RegisterPushTokenDTO {
  userId: string; // Extraído del token JWT en el controlador
  token: string;
  deviceType: string;
}