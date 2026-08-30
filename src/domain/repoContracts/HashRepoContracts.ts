
export interface HashRepository {
    
    hashPasswd(password: string): Promise<string>;
    verifyPasswd(hash: string, password: string): Promise<boolean>;

}