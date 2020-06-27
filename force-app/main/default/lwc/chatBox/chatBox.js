import { LightningElement, api, track } from 'lwc';

import chatterPrivateMessages from '@salesforce/apex/ChatterBoxController.fetchPrivateConversation';

export default class ChatBox extends LightningElement {
    @track chatInfo;
    @track chatMessages;
    messageText;
    
    @api 
    get chatUserInfo(){
        console.log('in getter');
        return this.chatInfo;
    };
    set chatUserInfo(value){
        this.chatInfo = value;
        if(this.chatInfo.Id!=null){
            chatterPrivateMessages({recipientID: this.chatInfo.Id, type: 'fetch', messageText: ''}).then(result => {
                console.log('*****Result in chat box pm::',result);
                this.chatMessages = result;
            }).catch(error => {
                console.log('****Error :::',error);
            });
        }
    }

    handleMessageText(event){
        this.messageText = event.target.value;
    }

    handleSend(event){
        //console.log(':)......'+JSON.stringify(event));
        console.log(':)......'+event.ctrlKey);
        if (event.ctrlKey) {
            console.log('hs......');
            if (event.keyCode == 13) {
                console.log('after enter');
                console.log('Message.....'+this.messageText);
                console.log('User Id.....'+this.chatInfo.Id);
            	if(this.messageText!=null && this.messageText!=''){
                    chatterPrivateMessages({recipientID: this.chatInfo.Id, type: 'send', messageText: this.messageText}).then(result => {
                        console.log('*****Result in chatbox hs::',result);
                        this.chatMessages = result;
                        this.messageText = '';
                    }).catch(error => {
                        console.log('****Error :::',error);
                    });
                }
            }
        }
    }
}