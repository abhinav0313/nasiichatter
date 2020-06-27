import { LightningElement,track,api } from 'lwc';
import saveTheFeed from '@salesforce/apex/ChatterFeedsDetail.saveFeed';

export default class CreateFeed extends LightningElement {
    @track body;
    @api groupId;
    @api mode;
    @api feedId;
    @api mappingKey;

    handleBody(event){
        this.body = event.target.value;
    }

    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }

    saveFeed(){
        console.log('INCREATEFEED-MODE::'+this.mode);
        console.log('INCREATEFEED-FEEDID::'+this.feedId);
        if(this.mode == 'create'){
            this.feedId = '';
        }
        saveTheFeed({groupId: this.groupId, message: this.body, mode: this.mode, feedId: this.feedId}).then(result => {
            console.log('****RESULT OF GROUP::'+result);
            this.closeModal();
            this.dispatchEvent(new CustomEvent('save', { detail: {name : this.mappingKey} }));
        }).catch(error => {
            console.log('ERROR::'+error);
        });
        console.log('***GroupINs onsave::'+JSON.stringify(this.groupIns));
    }
}