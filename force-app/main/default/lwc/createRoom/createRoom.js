import { LightningElement, track, wire} from 'lwc';

import availableGroups from '@salesforce/apex/ChatterUserController.fetchAllGroups';
import saveTheRoom from '@salesforce/apex/ChatterUserController.saveTheRoom';

export default class CreateRoom extends LightningElement {
    @track roomName;
    selectedGroupsForRoom = [];
    @wire(availableGroups) availabeleGroupsForRoom;
    
    handleRoomName(event){
        this.roomName = event.target.value;
    }

    handleGroupToRoom(event){
        console.log('inside*******',event.detail.value);
        this.selectedGroupsForRoom = event.detail.value;
    }

    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }

    saveRoom(){
        var groupIDString = '';
        this.selectedGroupsForRoom.forEach(result => {
            if(groupIDString === '')
                groupIDString = result;
            else
            groupIDString+= ','+result;
        });
        console.log('****FINAL STRING::',groupIDString);
        saveTheRoom({name: this.roomName, groupIds: groupIDString}).then(result => {
            console.log(result);
            closeModal();
        }).catch(error => {
            console.log('error::',error);
        });
    }

    handleCreateGroup(){
        
    }
    get groupForRoom(){
        var valueList = [];
        if(this.availabeleGroupsForRoom!=null){
            console.log('*****Available groups::',this.availabeleGroupsForRoom);
            console.log('inside data********',this.availabeleGroupsForRoom.data);
            this.availabeleGroupsForRoom.data.forEach(result => {
                console.log('inside iteration********',result);
                valueList.push({label: result.groupName, value: result.groupID});
                console.log('inside iteration********');
            });
            console.log('*****Group FOR ROOM::',valueList);
        }
        return valueList;
    }
}