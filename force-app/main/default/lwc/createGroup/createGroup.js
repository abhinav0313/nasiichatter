import { LightningElement, track } from 'lwc';

import saveTheGroup from '@salesforce/apex/ChatterUserController.saveTheGroup';

export default class CreateGroup extends LightningElement {
   
    @track name;
    @track description;
    @track isPrivate;
    @track informationTitle;
    @track informationBody;

    handleName(event){
        this.name = event.target.value;
    }

    handleDescription(event){
        this.description = event.target.value;
    }

    handleIsPrivate(event){
        this.isPrivate = event.target.value;
        console.log('*****isprivate::'+this.isPrivate);
    }

    handleInformationTitle(event){
        this.informationTitle = event.target.value;
    }

    handleInformationBody(event){
        this.informationBody = event.target.value;
    }

    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }

    saveGroup(){
        saveTheGroup({groupName: this.name, description: this.description, type: this.isPrivate, title: this.informationTitle, text: this.InformationBody}).then(result => {
            console.log('****RESULT OF GROUP::'+result);
            closeModal();
        }).catch(error => {
            console.log('ERROR::'+error);
        });
        console.log('***GroupINs onsave::'+JSON.stringify(this.groupIns));
    }
}