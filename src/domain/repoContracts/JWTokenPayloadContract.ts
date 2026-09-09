export interface IgorJwtPayload {
  sub: string;  // Subject (user ID) 
  role: string; // User role ('PARENT', 'CHILD') 
  iat?: number;  
  exp?: number;  
}