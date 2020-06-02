import { LightningElement, api , track, wire} from 'lwc';

import BACKGROUND_IMAGE from '@salesforce/resourceUrl/chatbackground';

import fetchUsers from '@salesforce/apex/ChatterBoxController.fetchUsers';

import allRooms from '@salesforce/apex/ChatterUserController.fetchAllRooms';
import allGroups from '@salesforce/apex/ChatterUserController.fetchAllGroups';

export default class ChatterParent extends LightningElement {
    
    @wire(fetchUsers) userWrapperList;
    @track showChatBox;
    bgImage;
    @wire(fetchUsers) userWrapperListCopy;
    backgroundImage = BACKGROUND_IMAGE;
    @track sendToID;
    @track chatterMessages;
    @track messageText;
    @track createRoom = false;
    @track createGroup = false;
    @track activeSections =[];
    @wire(allRooms) allRoomsWrapper;
    @wire(allGroups) allGroupWrapper;
    @track roomLabel;
    @track groupLabel;

    connectedCallback(){
        console.log('inside parent...::'+this.allGroupWrapper.data);
        if(this.allRoomsWrapper != undefined)
            this.roomLabel = 'Rooms('+this.allRoomsWrapper.length+')';
        else
            this.roomLabel = 'Rooms(0)';
        if(this.allGroupWrapper != undefined)
            this.groupLabel = 'Groups('+this.allGroupWrapper.length+')';
        else
            this.groupLabel = 'Groups(0)';
        this.activeSections.push('Chat');
        this.bgImage = 'background-image: url("'+this.backgroundImage+'");';
    }

    getIfDataExists(){
        if(userWrapperList){
            return true;
        }
        else
            return false;
    }
    searchUser(event){
        var searchKey;
        searchKey = event.target.value;
        console.log('*****searchvalue::',searchKey);
        searchKey = searchKey.toLowerCase();
        if(searchKey!=null && searchKey!=''){
            var users = [];
            var i;
            var updatedUsers = [];
            users.push(this.userWrapperListCopy);
            for(i=0; i<users[0].data.length; i++){
                var name = (users[0].data[i].usr.Name).toLowerCase();            
                if(name.includes(searchKey)){
                    updatedUsers.push(users[0].data[i]);
                    console.log('***values::',users[0].data[i].usr.Name);
                }
            }
            this.userWrapperList.data = updatedUsers;
        }
        else
            this.userWrapperList.data = this.userWrapperListCopy.data;
    }

    handleStartChat(event){
        this.sendToID = event.currentTarget.dataset.item;
        console.log('****send to Id::',this.sendToID);
        
    }

    get isChatStarted(){
        console.log('****SENDTOID:::',this.sendToID);
        return (this.sendToID!=null ? true:false);
    }

    handleCreateRoom(){
        this.createRoom = true;
    }

    handleCreateGroup(){
        this.createGroup = true;
    }

    closeModal(){
        this.createRoom = false;
        this.createGroup = false;
    }

    handleToggleSection(event){
        this.activeSections = [];
        const openSectionName = event.detail.openSections;
        //const accordian = this.template.querySelector('.main-menu');
        var actives = [];
        actives.push(openSectionName);
        actives.push('Chat');
        this.activeSections = actives;
    }

    saveGroup(){
        console.log('*****SUBMITTING GROUP******');
    }

    
    /*getVariant(){
        return (this.userWrapperList.isActive === 'online' ? 'success' : '');
    }

    getActiveClass(){
        return (this.userWrapperList.isActive === 'online' ? 'chatStatusOnline' : 'chatStatusOffline');
    }*/
}
