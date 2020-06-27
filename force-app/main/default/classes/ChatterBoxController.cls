public with sharing class ChatterBoxController{
    @AuraEnabled(cacheable=true)
    public static List<Wrapper> fetchUsers(){
        Set<ID> uIDSet = new Set<ID>();
        List<Wrapper> wrapList = new List<Wrapper>();
        List<AuthSession> authSList = new List<AuthSession>(); 
        authSList = [Select UsersId,iscurrent, UserType,NumSecondsValid,LoginType, LastModifiedDate,Id, CreatedDate From AuthSession];
        for(AuthSession aus : authSList){
            if(aus.LastModifiedDate.addSeconds(aus.NumSecondsValid) >= system.now() && aus.UsersId!=null){
                uIDSet.add(aus.UsersId);
            }
        } 
        if(uIDSet!=null && uIDSet.size()>0){
            ID currentUId = UserInfo.getUserId();
            uIDSet.remove(currentUId);
            for(User usr : [select id,name,firstname,lastname,FullPhotoUrl,SmallPhotoUrl from User where IsActive =:true AND Name!='Automated Process' AND Id!=:currentUId ORDER by Name]){
                Boolean act = false;
                if(uIDSet.contains(usr.Id))
                    act = true;
                wrapList.add(new Wrapper(usr,act));
            }
        }
        wrapList.sort();  
        System.debug('********List::'+wrapList);
        return wrapList;
    }
    
    @AuraEnabled
    public static List<ChatterWrapper> fetchPrivateConversation(String recipientID, String type, String messageText){
        List<ChatterConversationMember> recieverID = new List<ChatterConversationMember>();
        List<ChatterMessage> chatterMessageThread = new List<ChatterMessage>();
        List<ChatterWrapper> chatterWrapperList = new List<ChatterWrapper>();
        system.debug('****recipientID::'+recipientID);
        system.debug('****type::'+type);
        system.debug('****messageText::'+messageText);
        /**** Type is send starts ****/
        if(type=='send'){
            ConnectApi.ChatterMessages.sendMessage(messageText, recipientID);
        }
        /**** Type is send ends ****/
        recieverID = [SELECT Id, ConversationId, Memberid FROM ChatterConversationMember where Memberid=:recipientID];
        if(recieverID!=null && recieverID.size()>0){
            chatterMessageThread = [SELECT Body, ConversationId, Id, SenderId, SentDate FROM ChatterMessage where ConversationId=:recieverID[0].ConversationId ORDER BY SentDate];
            if(chatterMessageThread!=null && chatterMessageThread.size()>0){
                for(ChatterMessage cm : chatterMessageThread){
                    ChatterWrapper cw;
                    if(cm.SenderId != UserInfo.getUserId())
                        cw = new ChatterWrapper(cm.Body, cm.Id, false, cm.SentDate);
                    else
                        cw = new ChatterWrapper(cm.Body, cm.Id, true, cm.SentDate);

                    chatterWrapperList.add(cw);
                }
                return chatterWrapperList;
            }
        }
        return null;
    }

    @AuraEnabled
    public static String sendPost(String toId, String postMessage){
        try{
            String message = '{'+toId+'} \n '+postMessage;
            ConnectApiHelper.postFeedItemWithRichText(null, UserInfo.getUserId(), message);
            return 'success';
        }
        catch(Exception ex){
            return String.valueOf('error::'+ex);
        }
    }
    
    public class Wrapper implements Comparable{
        @AuraEnabled
        public User usr{get;set;}
        
        @AuraEnabled
        public String initials{get;set;}
        
        @AuraEnabled
        public String isActive{get;set;}

        @AuraEnabled
        public String varinat{get;set;}
        
        public Wrapper(User usr, Boolean isAct){
            this.usr = usr;
            system.debug('***firstlast:::'+usr.FirstName+'----'+usr.LastName);
            if(usr.FirstName!=null && usr.LastName!=null)
            	this.initials = usr.FirstName.substring(0,1)+usr.LastName.substring(0,1);
            else
                this.initials = 'PR';
            if(isAct){
                this.isActive = 'position: absolute; margin: -12px 0px 0px 23px;';
                this.varinat = 'success';
            }
            else{
                this.isActive = 'display : none;';
                this.varinat = '';
            }
        }
        
        public Integer compareTo(Object ObjToCompare) {
            if(isActive.CompareTo(((Wrapper)ObjToCompare).isActive) > 0)
            	return -1;
            else if(isActive.CompareTo(((Wrapper)ObjToCompare).isActive) < 0)
                return +1;
            else
                return 0;
        }
    }

    public class ChatterWrapper {

        @AuraEnabled
        public String message {get; set;}

        @AuraEnabled
        public String chatID {get; set;}

        @AuraEnabled
        public String chatStyle {get; set;}

        @AuraEnabled
        public Datetime sentDate {get; set;}

        public ChatterWrapper(String msg, String chatID, Boolean isSenderMe, Datetime dt){
            this.message = msg;
            this.chatID = chatID;
            this.sentDate = dt;
            if(isSenderMe){
                this.chatStyle = 'border: none; background: rgb(154, 234, 157); margin: 5px; color: black !important; border-radius: 10px; width: 70%; float: right;';
            }
            else {
                this.chatStyle = 'border: none; background: rgb(255, 255, 255); margin: 5px; color: black; border-radius: 10px; width: 70%; float: left;';
            }
        }
    }
}
