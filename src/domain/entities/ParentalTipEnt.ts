export class ParentalTipEnt {
    public readonly id:  string
    public readonly title: string
    public readonly content: string
    public readonly created_at: Date

    constructor(id: string, title: string, content: string, created_at: Date){
        this.id = id
        this.title = title
        this.content = content
        this.created_at = created_at || null
        return this
    } 

    public static createParentalTip(title: string, content: string): ParentalTipEnt{
        const id = crypto.randomUUID()
        const created_at = new Date()
        return new ParentalTipEnt(id, title, content, created_at)
    }
}