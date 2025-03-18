export class ConsoleMessage {
    type: 'Warn' | 'Error' | 'Info' | 'Success';
    message: string;
    constructor (type: 'Warn' | 'Error' | 'Info' | 'Success', message: string) {
        this.type = type;
        this.message = message;
        this.log();
    }
    private log (): void {
        const successColor = '\u001b[32m'; // Vert
        const errorColor = '\u001b[31m';   // Rouge
        const infoColor = '\u001b[36m';    // Cyan
        const warningColor = '\u001b[33m'; // Jaune
        const resetColor = '\u001b[0m';    // Réinitialisation
        switch (this.type) {
            case 'Warn':
                console.log(warningColor + "[Warn]" + resetColor + ` ${this.message}`);
                break;
            case 'Error':
                console.log(errorColor + "[Error]" + resetColor + ` ${this.message}`);
                break;
            case 'Info':
                console.log(infoColor + "[Info]" + resetColor + ` ${this.message}`);
                break;
            case 'Success':
                console.log(successColor + "[Success]" + resetColor + ` ${this.message}`);
                break;
        }
    }
}