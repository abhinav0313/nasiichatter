import { LightningElement, api , track, wire} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BACKGROUND_IMAGE from '@salesforce/resourceUrl/chatbackground';
import fetchUsers from '@salesforce/apex/ChatterBoxController.fetchUsers';
import fetchAllRooms from '@salesforce/apex/ChatterUserController.fetchAllRooms';
import fetchAllGroups from '@salesforce/apex/ChatterUserController.fetchAllGroups';
import fetchFeeds from '@salesforce/apex/ChatterFeedsDetail.fetchGroupFeed';
import deleteGroup from '@salesforce/apex/ChatterUserController.deleteTheGroup';
import deleteFeedPost from '@salesforce/apex/ChatterFeedsDetail.deleteFeed';
import existingMembers from '@salesforce/apex/ChatterUserController.fetchExistingMembers';
import deleteSelectedMembers from '@salesforce/apex/ChatterUserController.deleteMembersFromGroup';
import addMembers from '@salesforce/apex/ChatterUserController.addMemberToGroup';
export default class ChatterParent extends LightningElement {
    
    @wire(fetchUsers) userWrapperList;
    @track showChatBox;
    @track isCreateFeed = false;
    @track chatterMessages;
    @track messageText;
    @track createRoom = false;
    @track createGroup = false;
    @track createFeed = false;
    @track editGroup = false;
    @track manageMember = false;
    @track activeSections =[];
    @track groupId_n_Info = {};
    @track isInitial = true;
    @track isGroupChatStarted = false;
    @track isChatStarted = false;
    @track selectedGroupInfo = {};
    @track currentGroupId;
    @track chatUserInfo = {};
    @track feeds = [];
    @track tempo;
    @track groupMode;
    @track feedMode;
    @track feedIdToEdit;
    @track existingMembers = [];
    @track membersIdsToDelete = '';
    @track membersToAdd = [];
    @track addedMemberIds;
    @track toggleManageMembertabs = true;
    @track sidebarStructure = [];
    @track selectedGroupKey;
    bgImage;
    bannerOfSelectedGroup;
    usersInfo = {};
    usersInfoList = [];
    backgroundImage = BACKGROUND_IMAGE;
    mapping = {};
    currentUserName;
    currentUserPhoto;
    groupID_vs_groupName = new Map();
    roleValue = 'Standard';
    wiredRooms;
    @wire(fetchUsers) userWrapperListCopy;
    @wire(fetchAllGroups) 
    allGroupWrapper;
    @wire(fetchUsers) 
    userWrapperListCopy1({error, data}){
        if(data){
            this.mapUserDataToID(data);
            this.usersInfoList = data;
        }
        else if(error){
            console.log(error);
        }
    }
    @wire(fetchAllRooms)
    allRoomsWrapper(value) {
        this.wiredRooms = value;
        const { data , error} = value;
        if (data) {
            this.fetchRoomStructure(data);
        } else if (error) {
            console.log(error);
            
        }
    }
    @wire(getRecord, { recordId: USER_ID, fields: ['User.Name','User.SmallPhotoUrl'] }) 
    userWire({error,data}){
        if(data){
            //console.log('**User::'+JSON.stringify(data));
            this.currentUserName = data.fields.Name.value;
            this.currentUserPhoto = data.fields.SmallPhotoUrl.value;
        } else if(error){
            console.log(error);
        }
    }

    connectedCallback(){
        this.bgImage = 'background: white;';
    }

    refreshRoomWire(){
        refreshApex(this.wiredRooms);
    }

    refreshGroupWire(){
        refreshApex(this.allGroupWrapper);
    }

    getIfDataExists(){
        if(userWrapperList){
            return true;
        }
        else
            return false;
    }

    mapUserDataToID(usersData){
        //console.log('****USerdata::::'+JSON.stringify(usersData));
        //console.log('***Profiles:::'+usersData[0].usr.FullPhotoUrl);
        usersData.forEach(result => {
            this.usersInfo[result.usr.Id] = {
                'Photo' : result.usr.SmallPhotoUrl,
                'Name' : result.usr.Name
            };
        });
        this.usersInfo[USER_ID] = {
            'Photo' : this.currentUserPhoto,
            'Name' : this.currentUserName,
        };
        //console.log('****USerdata::::'+JSON.stringify(this.usersInfo));
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
        this.bgImage = 'background-image: url("'+this.backgroundImage+'");padding-top:0px;';
        this.chatUserInfo = {};
        this.chatUserInfo['Photo'] = event.currentTarget.dataset.photo;
        this.chatUserInfo['Name'] = event.currentTarget.dataset.name;
        this.chatUserInfo['Id'] = event.currentTarget.dataset.item;
        this.chatUserInfo['IsActive'] = event.currentTarget.dataset.isactive;
        this.chatUserInfo['Variant'] = event.currentTarget.dataset.variant;
        //this.sendToID = event.currentTarget.dataset.item;
        this.isInitial = false;
        this.isChatStarted = true;
        this.isGroupChatStarted = false;
        console.log('****send to Id::',this.chatUserInfo['Id']);
        
    }

    handleCreateRoom(){
        this.createRoom = true;
    }

    handleCreateGroup(){
        this.groupMode = 'create';
        this.createGroup = true;
    }

    handleCreateFeed(){
        this.feedMode = 'create';
        this.feedIdToEdit = '';
        this.createFeed = true;
    }

    handleGroupEdit(){
        this.groupMode = 'edit';
        this.createGroup = true;
    }

    handleFeedEdit(event){
        console.log('ONPARENT_FEEDID::'+event.detail);
        this.feedMode = 'edit';
        this.feedIdToEdit = event.detail;
        this.createFeed = true;
    }
    
    handleGroupDelete(){
        var msg ='Are you sure you want to delete this group?';
        if (confirm(msg)) {
            deleteGroup({groupId: this.selectedGroupInfo.Id}).this(result => {
                const event = new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Group deleted successfully',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
                console.log(result);
                location.reload(true);
            }).catch(error => {
                console.log(error);
            });
        }
    }

    handleFeedDelete(event){
        deleteFeedPost({feedId: event.detail.Id}).then(result => {
            const event = new ShowToastEvent({
                title: 'Success!!',
                message: 'Feed deleted successfully',
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);
            console.log(result);
            this.handleSidebar(event);
        }).catch(error =>{
            console.log(error);
        });
    }

    handleGroupMembers(){
        this.manageMember = true;
        this.selectedGroup_Members();
    }

    closeModal(){
        this.createRoom = false;
        this.createGroup = false;
        this.createFeed = false;
        this.manageMember = false;
        //this.currentGroupId = '';
        this.feedIdToEdit = '';
    }

    saveGroup(){
        console.log('*****SUBMITTING GROUP******');
    }
    
    fetchSidebarStructure(roomStructure, groupStructure){
        let newItems = [];
        const newItem1 = {
            label: 'Rooms',
            name: 0,
            id: 'NA',
            expanded: true,
            disabled: false,
            items: roomStructure,
        };
        const newItem2 = {
            label: 'All Groups',
            name: 10000,
            id: 'NA',
            expanded: true,
            disabled: false,
            items: groupStructure,
        };
        this.mapping[newItem1.name] = newItem1.id;
        this.mapping[newItem2.name] = newItem2.id;
        newItems.push(newItem1);
        newItems.push(newItem2);
        this.sidebarStructure = newItems;
        //console.log('****Sidebar::'+JSON.stringify(this.sidebarStructure));
    }

    fetchRoomStructure(info){
        
        var itemArray = [];
        this.allGroupWrapper.data.forEach(result => {
            this.groupID_vs_groupName.set(result.Id, result.Name);
            itemArray.push(this.groupID_vs_groupName);
            this.groupId_n_Info[result.Id] = {
                'Id' : result.Id,
                'Name' : result.Name,
                'Photo' : result.SmallPhotoUrl,
                'Type' : result.CollaborationType,
                'Members' : result.MemberCount,
                'Description' : result.Description,
                'Banner' : result.BannerPhotoUrl,
                'Body' : result.InformationBody,
                'Title' : result.InformationTitle,
                'Email' : result.GroupEmail
            };
        });
        let newItems = [];
        let counter = 1;
        info.forEach(result => {
            const newItem = {
                label: result.Name,
                name: counter,
                id: result.Id,
                expanded: false,
                disabled: false,
                items: [],
            };
            this.mapping[newItem.name] = newItem.id;
            var idList = result.GroupIDs__c.split(',');
            var innerCounter = counter;
            if(idList!=null && idList!=undefined){
                idList.forEach(innerRes => {
                    innerCounter+=1;
                    const newChildItem = {
                        label: this.groupID_vs_groupName.get(innerRes),
                        name: innerCounter,
                        id: innerRes,
                        expanded: false,
                        disabled: false,
                        items: [],
                    };
                    this.mapping[newChildItem.name] = newChildItem.id;
                    newItem.items.push(newChildItem);
                });
            }
            newItems.push(newItem);
            
            counter = innerCounter + 1;
        });

        this.fetchGroupStructure(newItems)
        return newItems;
    }

    fetchGroupStructure(roomInfo){
        let newItems = [];
        var counter = 10001;
        this.allGroupWrapper.data.forEach(result => {
            const newItem = {
                label: result.Name,
                name: counter,
                id: result.Id,
                expanded: false,
                disabled: false,
                items: [],
            };
            this.mapping[newItem.name] = newItem.id;
            newItems.push(newItem);
            counter+=1;
        });
        this.fetchSidebarStructure(roomInfo,newItems);
    }

    handleSidebar(event){
        this.bgImage = 'background-image: url("'+this.backgroundImage+'");padding-top:0px;';
        this.selectedGroupKey = event.detail.name;
        let grpID = this.mapping[event.detail.name];
        console.log('Label is: ' + grpID);
        this.feeds = [];
        if(grpID.startsWith('0F9')){
            this.currentGroupId = grpID;
            fetchFeeds({groupId : grpID}).then(result => {
                //console.log('****All Feed result::'+JSON.stringify(result));
                result.forEach(res => {
                    let feed = {};
                    console.log('****FeedsItem:::'+JSON.stringify(res.fcList));
                    feed['PostedbyId'] = res.cgf.InsertedById;
                    feed['Postedby'] = this.usersInfo[res.cgf.InsertedById].Name;
                    feed['PostedbyPhoto'] = this.usersInfo[res.cgf.InsertedById].Photo;
                    feed['Post'] = res.cgf.Body;
                    feed['PostedOn'] = res.cgf.CreatedDate;
                    feed['FeedId'] = res.cgf.Id;
                    feed['FeedItems'] = res.fcList;
                    this.feeds.push(feed);
                });
                //console.log('****feeds:::'+JSON.stringify(this.feeds));
                this.isInitial = false;
                this.isGroupChatStarted = true;
                this.isChatStarted = false; 
                this.selectedGroupInfo = this.groupId_n_Info[grpID];
                console.log('banner image::'+this.selectedGroupInfo.Banner);
                if(this.selectedGroupInfo.Banner!='/profilephoto/0F9/B')
                    this.bannerOfSelectedGroup = 'background-image: url("'+this.selectedGroupInfo.Banner+'");padding-top:0px;';
                else    
                    this.bannerOfSelectedGroup = 'border-bottom: 1px solid rgb(189, 189, 189); background: rgba(230, 230, 230, 1);padding-top:0px;';
                //console.log('****Selected group info:::'+JSON.stringify(this.selectedGroupInfo));
            }).catch(error => {
                console.log(error);
            });
        }
    }
    
    selectedGroup_Members(){
        this.existingMembers = [];
        existingMembers({groupId: this.selectedGroupInfo.Id}).then(result => {
            console.log('EXISTING MEMBERS::'+JSON.stringify(result));
            this.existingMembers = result;
        }).catch(error => {
            console.log(error);
        });
    }

    handleExistingMemberSelection(event){
        if(event.target.checked){
            if(this.membersIdsToDelete == '')
                this.membersIdsToDelete = event.currentTarget.dataset.memberid;
            else 
                this.membersIdsToDelete += ','+event.currentTarget.dataset.memberid
            console.log('IDS lIST::'+this.membersIdsToDelete);
        }
        else{
            console.log('ideee unc::'+event.currentTarget.dataset.memberid);
            let stringToReplace;
            if(this.membersIdsToDelete.includes(','+event.currentTarget.dataset.memberid)){
                stringToReplace = ','+event.currentTarget.dataset.memberid;
                this.membersIdsToDelete.replace(/stringToReplace/g,'');
                
            }
            else if(this.membersIdsToDelete.includes(event.currentTarget.dataset.memberid+',')){
                stringToReplace = event.currentTarget.dataset.memberid+',';
                this.membersIdsToDelete.replace(/stringToReplace/g,'');
                
            }    
            else{
                stringToReplace = event.currentTarget.dataset.memberid;
                this.membersIdsToDelete.replace(/stringToReplace/g,'');
                
            }
            console.log('IDS lIST::'+this.membersIdsToDelete);
        }
    }

    handleDeleteMembers(){
        if(this.membersIdsToDelete!='' && this.membersIdsToDelete!=null){
            deleteSelectedMembers({memberIds: this.membersIdsToDelete}).then(result => {
                console.log(result);
                this.selectedGroup_Members();
                this.manageMemberAddTabInfo();
                
            }).catch(error => {
                console.log(error);
            });
        }
    }

    handleManageMemberExistingTab(){
        this.toggleManageMembertabs = true;
    }

    handleManageMemberAddTab(){
        this.toggleManageMembertabs = false;
        //this.manageMemberAddTabInfo();
    }

    get manageMemberAddTabInfo(){
        let existingUserIds = [];
        //this.membersToAdd = [];
        let members = [];
        this.existingMembers.forEach(result =>{
            existingUserIds.push(result.userId);
        });

        console.log('List of exist user::'+JSON.stringify(existingUserIds));
        //console.log('List of userINFO::'+JSON.stringify(this.usersInfoList));
        this.usersInfoList.forEach(result =>{
            console.log(result.usr.Id);
            if(!existingUserIds.includes(result.usr.Id)){
                members.push({label: result.usr.Name,value: result.usr.Id});
            }
        });
        return members;
        //console.log('MEMBERS TO ADD::'+JSON.stringify(this.membersToAdd));
    }

    handleOnAddMember(event){
        this.addedMemberIds = event.detail.value;
        console.log('Added Members::'+this.addedMemberIds);
    }

    get roleOptions(){
        return [
            {label: 'Member', value: 'Standard'},
            {label: 'Manager', value: 'Admin'}
        ];
    }

    handleRoleChange(event){
        this.roleValue = event.detail.value;
    }

    handleSaveMembers(){
        console.log('SelectedUsersIDs::'+this.addedMemberIds);
        console.log('Role for these users::'+this.roleValue);
        addMembers({groupId: this.selectedGroupInfo.Id,
        memberIds: this.addedMemberIds, role: this.roleValue}).then(result =>{
            console.log(result);
            this.selectedGroup_Members();
            //this.manageMemberAddTabInfo();
            const event = new ShowToastEvent({
                title: 'Success!!',
                message: 'Member(s) added successfully',
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);
        }).catch(error => {
            console.log(error);
        });
        
        this.roleValue = 'Standard';
        this.addedMemberIds = [];
    }

    handleCurrentGroupEdit(event){
        console.log('Event before::'+event.detail.name);
        event.detail.name = this.selectedGroupKey;
        console.log('Event after::'+event.detail.name);
        this.handleSidebar(event);
    }
}
