import { LightningElement, api, track,wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import fetchUsers from '@salesforce/apex/ChatterBoxController.fetchUsers';
import saveFeedComment from '@salesforce/apex/ChatterFeedsDetail.saveFeedComment';
export default class Feed extends LightningElement {
    @api feedInfo = {};
    @track feedId;
    @track isFeedItemAvailable;
    @api mappingKey;
    @track feedItemInfo = [];
    usersInfo = {};
    @track isFocused = false;
    

    currentUserName;
    currentUserPhoto;
    
    @wire(getRecord, { recordId: USER_ID, fields: ['User.Name','User.SmallPhotoUrl'] }) 
    userWire({error,data}){
        if(data){
            //console.log('**User::'+JSON.stringify(data));
            this.currentUserName = data.fields.Name.value;
            this.currentUserPhoto = data.fields.SmallPhotoUrl.value;
        } else if(error){
            console.log('***error::'+error);
        }
    }

    @wire(fetchUsers) 
    userWrapperListCopy({error, data}){
        if(data){
            this.mapUserDataToID(data);
        }
        else if(error){
            console.log(error);
        }
    }

    mapUserDataToID(usersData){
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
        //console.log('****USerdata in feed::::'+JSON.stringify(this.usersInfo));
    }

    handleCommentFocus(){
        this.isFocused = !this.isFocused;
        console.log('^^FEEDID::'+JSON.stringify(this.feedItemInfo));
        this.feedMessage = '';
    }

    handleFeedItem(event){
        console.log('****Message:::'+JSON.stringify(event.target.value));
        this.feedMessage = event.target.value;
    }

    handleSend(){
        console.log('****FeedID:::'+this.feedInfo.FeedItems[0].FeedItemId);
        console.log('****Message:::'+this.feedMessage);
        saveFeedComment({feedId: this.feedInfo.FeedItems[0].FeedItemId, 
                        message: this.feedMessage}).then(result =>{
                            console.log('***Result::'+result);
                        }).catch(error =>{
                            console.log(error);
                        });
        this.feedMessage = '';
        this.isFocused = !this.isFocused;
    }

    get isFeedItemAvailable(){
        return this.feedItemInfo.length > 0 ? true: false;
    }

    get feedItems(){
        console.log('****FeedItems of feed::'+JSON.stringify(this.usersInfo));
        this.feedItemInfo = [];
        this.feedInfo.FeedItems.forEach(res => {
            let feedItem = {};
            console.log('****Commentator name::'+this.usersInfo[res.InsertedById].Name);
            console.log('****Commentator photo::'+this.usersInfo[res.InsertedById].Photo);
            feedItem['Postedby'] = this.usersInfo[res.InsertedById].Name;
            feedItem['PostedbyId'] = res.InsertedById;
            feedItem['PostedOn'] = res.CreatedDate;
            feedItem['PostedbyPhoto'] = this.usersInfo[res.InsertedById].Photo;
            feedItem['Post'] = res.CommentBody;
            feedItem['FeedId'] = res.FeedItemId;
            this.feedItemInfo.push(feedItem);
        });
        
        console.log('***FeedItems iin feeds::'+JSON.stringify(this.feedItemInfo));
        return this.feedItemInfo;
    }

    handleEdit(){
        this.dispatchEvent(new CustomEvent('edit', { detail: this.feedInfo.FeedId }));

    }

    handleDelete(){
        var msg ='Are you sure you want to delete this feed?';
        if (confirm(msg)) {
            this.dispatchEvent(new CustomEvent('delete', { detail: {Id: this.feedInfo.FeedId, name: this.mappingKey }}));
        }
    }
    
    get senderPhoto(){ 
        return this.feedInfo.PostedbyPhoto;
    }
    get senderName(){ 
        return this.feedInfo.Postedby;
    }
    get postedAt(){ 
        return this.feedInfo.PostedOn;
    }
    get feedBody(){ 
        return this.feedInfo.Post;
    }

    get gotoUser(){
        return '/'+this.feedInfo.PostedbyId;
    }

    /*get fecthFeedId(){
        this.feedId = this.feedInfo.FeedId;
        console.log('****FeedID::'+this.feedId);
        return this.feedId;
    }*/
}