// appError.js
const httpstatustext=require('./httpStatusText');
class AppError extends Error {
    constructor() {
        super();
    }
    create(message,status){
        this.status=status;
        this.message=httpstatustext.getStatusText(status)+": "+message;
        this.category=httpstatustext.getStatusCategory(status);
        return this;
    };
    createbeginmassage(addtomassage,status){
        this.status=status;
        this.message=addtomassage+httpstatustext.getStatusText(status);
        this.category=httpstatustext.getStatusCategory(status);
        return this;
    };
    createnomassage(status){
        this.status=status;
        this.message=httpstatustext.getStatusText(status);
        this.category=httpstatustext.getStatusCategory(status);
        return this;
    };
}

module.exports = new AppError();