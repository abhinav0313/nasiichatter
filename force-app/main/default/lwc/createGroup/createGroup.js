import { LightningElement, track, api } from 'lwc';

import saveTheGroup from '@salesforce/apex/ChatterUserController.saveTheGroup';

export default class CreateGroup extends LightningElement {
    @track groupInformation;
    @track groupMode;
    @track id;
    @track name;
    @track description;
    @track isPrivate = false;
    @track informationTitle;
    @track informationBody;
    @track headerTitle;

    @api 
    get mode(){
        return this.groupMode;
    }
    set mode(value){
        this.groupMode = value;
        if(this.groupMode == 'create')
            this.headerTitle = 'Create Group';
        else    
        this.headerTitle = 'Edit Group';
    }

    @api 
    get groupInfo(){
        return this.groupInformation;
    }

    set groupInfo(value){
        if(value!=null){
            this.name = value.Name;
            this.description = value.Description;
            this.isPrivate = (value.Type == 'Private')? true : false;
            console.log('isPivate::'+this.isPrivate);
            this.informationTitle = value.Title;
            this.informationBody = value.Body;
            this.id = value.Id;
        }
        else
            this.id = '';
        console.log('GROUP_INFO::'+JSON.stringify(value));
    }

    handleName(event){
        this.name = event.target.value;
    }

    handleDescription(event){
        this.description = event.target.value;
    }

    handleIsPrivate(event){
        this.isPrivate = event.target.checked;
        console.log('*****isprivate::'+this.isPrivate);
    }

    handleInformationTitle(event){
        this.informationTitle = event.target.value;
    }

    handleInformationBody(event){
        console.log('INFO::'+event.target.value);
        this.informationBody = event.target.value;
    }

    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }

    saveGroup(){
        console.log('THE MODE IS::::'+this.groupMode);
        console.log('THE GROUP ID IS::::'+this.id);
        if(this.headerTitle == 'Create Group')
            this.id = '';

        saveTheGroup({groupId: this.id, groupName: this.name, description: this.description, type: this.isPrivate, title: this.informationTitle, body: this.InformationBody, mode: this.groupMode}).then(result => {
            console.log('****RESULT OF GROUP::'+result);
            this.closeModal();
            let type;
            if(this.isPrivate)
                type = 'Private';
            else    
                type = 'Public';
            if(this.headerTitle == 'Edit Group'){
                let updatedGroup = {
                    ['Name'] : this.name,
                    ['Desription'] : this.description,
                    ['Title'] : this.informationTitle,
                    ['Body'] : this.informationBody,
                    ['Type'] : type
                };
                this.dispatchEvent(new CustomEvent('edit', {detail: {name: 'TEMPORARY_VALUE'}}));
            }
            else    
                this.dispatchEvent(new CustomEvent('save'));
        }).catch(error => {
            console.log('ERROR::'+error);
        });
    }

}