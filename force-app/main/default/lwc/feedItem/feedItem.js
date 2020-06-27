import { LightningElement,api,wire,track } from 'lwc';

export default class FeedItem extends LightningElement {
    @api feedItemInfo = {}
    @track feedMessage;

    connectedCallback(){
        console.log('***FeedItem::'+JSON.stringify(this.feedItemInfo));
    }

    get senderPhoto(){ 
        console.log('***FeedItem::'+JSON.stringify(this.feedItemInfo));
        return this.feedItemInfo.PostedbyPhoto;
    }
    get senderName(){ 
        return this.feedItemInfo.Postedby;
    }
    get postedAt(){ 
        return this.feedItemInfo.PostedOn;
    }
    get feedBody(){ 
        return this.feedItemInfo.Post;
    }

    get gotoUser(){
        return '/'+this.feedItemInfo.PostedbyId;
    }

}