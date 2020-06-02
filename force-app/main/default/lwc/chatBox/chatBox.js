import { LightningElement, api, track } from 'lwc';

import chatterPrivateMessages from '@salesforce/apex/ChatterBoxController.fetchPrivateConversation';

export default class ChatBox extends LightningElement {
    @api chatUserId;
    @track userId;
    @track privateMessages;
    @track messageText;

    connectedCallback(){
        //this.userId = this.chatUserId;
        console.log('****send to in child ::',this.chatUserId);
        if(this.chatUserId!=null){
            chatterPrivateMessages({recipientID: this.chatUserId, type: 'fetch', messageText: ''}).then(result => {
                console.log('*****Result in chat box ccb::',result);
                this.chatterMessages = result;
            }).catch(error => {
                console.log('****Error :::',error);
                return error;
            });
        }
    }
    @api
    get chatterMessages(){
        console.log('****send to in child ::',this.userId);
        if(this.chatUserId!=null){
            chatterPrivateMessages({recipientID: this.chatUserId, type: 'fetch', messageText: ''}).then(result => {
                console.log('*****Result in chat box ccb::',result);
                return result;
            }).catch(error => {
                console.log('****Error :::',error);
                return error;
            });
        }
    }
    set chatterMessages(value){
        console.log('******privatemsgs::'+value);
        this.privateMessages = value;
    }
    handleMessageText(event){
        this.messageText = event.target.value;
    }

    handleSend(){
        if(this.messageText!=null && this.messageText!=''){
            chatterPrivateMessages({recipientID: this.chatUserId, type: 'send', messageText: this.messageText}).then(result => {
                console.log('*****Result in chatbox hs::',result);
                this.chatterMessages = result;
                this.messageText = '';
            }).catch(error => {
                console.log('****Error :::',error);
            });
        }
    }

    get isChatStarted(){
        return (this.sendToID!=null ? true:false);
    }
}