public with sharing class ChatterUserController {
    
    @AuraEnabled(cacheable=true)
    public static List<GroupRoom__c> fetchAllRooms(){
        List<GroupRoom__c> grwList = new List<GroupRoom__c>();
        for(GroupRoom__c gr : [SELECT id, name, groupIds__c from GroupRoom__c ORDER BY name]){
            //GroupRoom__c grw = new GroupRoom__c(gr);
            grwList.add(gr);
        }
        system.debug('****ROOOOOOM LIST::'+grwList);
        return grwList;
    }

    @AuraEnabled
    public static String saveTheRoom(String name, String groupIds){
        try{
            if(groupIds!=null && groupIds!=''){
                GroupRoom__c g_room = new GroupRoom__c();
                g_room.name = name;
                g_room.GroupIDs__c = groupIds;
                insert g_room;
                return 'success';
            }
        }catch(Exception e){
            return e.getStackTraceString();
        }
        return null;
    }
    @AuraEnabled(cacheable=true)
    public static List<CollaborationGroup> fetchAllGroups(){
        List<Id> groupIds = new List<Id>();
        for(CollaborationGroupMember cgm : [SELECT Id,CollaborationGroupId FROM CollaborationGroupMember WHERE MemberId= :UserInfo.getUserId() ]){
            groupIds.add(cgm.CollaborationGroupId);
        }
        List<CollaborationGroup> gwList = new List<CollaborationGroup>();
        for(CollaborationGroup cg : [select Id, Name, CollaborationType,BannerPhotoUrl, Description, MemberCount, SmallPhotoUrl, FullPhotoUrl, InformationTitle, InformationBody,GroupEmail from CollaborationGroup ORDER BY Name]){
            //GroupWrapper gw = new GroupWrapper(cg);
            if(cg.CollaborationType == 'Public')
                gwList.add(cg);
            else{
                if(groupIds!=null && groupIds.size()>0 && groupIds.contains(cg.Id))
                    gwList.add(cg);
            }
        }
        return gwList;
    }

    @AuraEnabled
    public static String saveTheGroup(String groupId,String groupName,String description,Boolean type,String title,String body,String mode){
        try{
            if(groupName!=null && groupName!=''){
                ConnectApi.ChatterGroupInput groupInput = new ConnectApi.ChatterGroupInput();
                groupInput.name = groupName;
                if(type)
                    groupInput.visibility = ConnectApi.GroupVisibilityType.PrivateAccess;
                else
                    groupInput.visibility = ConnectApi.GroupVisibilityType.PublicAccess;
                groupInput.description = description;

                if((title !=null && title !='') || (body !=null && body!='')){
                    ConnectApi.GroupInformationInput info = new ConnectApi.GroupInformationInput();
                    if(title !=null && title !='')
                        info.title = title;
                    if(body !=null && body!='')
                        info.text = body;
                    
                    groupInput.Information = info;
                }
                system.debug('****GroupInput::'+groupInput);
                system.debug('****GroupId::'+groupId);
                ConnectApi.ChatterGroupDetail g;
                system.debug('****Mode::'+mode);
                if(mode == 'edit')
                    g = ConnectApi.ChatterGroups.updateGroup(null,groupId,groupInput);    
                else
                    g = ConnectApi.ChatterGroups.createGroup(null, groupInput);
                
                /*CollaborationGroupMember member = new CollaborationGroupMember();
                member.MemberId = '0059D000001btGu' ;
                member.CollaborationGroupId = colGroup.Id ;
                member.CollaborationRole = 'Admin';
                insert member;*/
                return 'success';
            }
        }catch(Exception e){
            return e.getStackTraceString();
        }
        return null;
    }

    @AuraEnabled
    public static String deleteTheGroup(String groupId){
        try{
            ConnectApi.ChatterGroups.deleteGroup(null, groupId);
            return 'success';
        }catch(Exception e){
            return e.getStackTraceString();
        }
    }

    @AuraEnabled
    public static String deleteMembersFromGroup(String memberIds){
        try{
            List<String> memberIdsToDelete = memberIds.split(',');
            for(String memberId : memberIdsToDelete){
                if(memberId!=null && memberId!=''){
                    ConnectApi.ChatterGroups.deleteMember(null, memberId);
                }
            }
            return 'success';
        }catch(Exception e){
            return e.getStackTraceString();
        }
    }

    @AuraEnabled
    public static String addMemberToGroup(String groupId, List<String> memberIds, String role){
        //ConnectApi.GroupMembershipType roleType = ConnectApi.GroupMembershipType.parse(role);
        List<CollaborationGroupMember> cgmList = new List<CollaborationGroupMember>();
        if(groupId!=null && groupId!='' 
            && memberIds!=null && memberIds.size()>0 
            && role!=null && role!=''){
            for(String userId : memberIds){
                CollaborationGroupMember cgm = new CollaborationGroupMember();
                cgm.CollaborationGroupId = groupId;
                cgm.CollaborationRole = role;
                cgm.MemberId = userId;
                cgmList.add(cgm);
            }
            insert cgmList;
            return 'success';
        }
        return null;
    }

    @AuraEnabled
    public static List<MemberInfoWrapper> fetchExistingMembers(String groupId){
        List<MemberInfoWrapper> miwList = new List<MemberInfoWrapper>();
        if(groupId!=null && groupId!=''){
            ConnectApi.GroupMemberPage pg = ConnectApi.ChatterGroups.getMembers(null, groupId, 0, 100);
            for(ConnectApi.GroupMember cm : pg.members){ 
                miwList.add(new MemberInfoWrapper(cm.user.name,cm.user.id,String.valueOf(cm.role),cm.id));
            }
        }        
        return miwList;
    }

    public class MemberInfoWrapper{
        @AuraEnabled
        public String userName {get; set;}

        @AuraEnabled
        public String userId {get; set;}
        
        @AuraEnabled
        public String role {get; set;}

        @AuraEnabled
        public String memberId {get; set;}

        @AuraEnabled
        public Boolean abandon {get; set;}

        public MemberInfoWrapper(String uName, String uId, String role, String mId){
            this.userName = uname;
            this.userId = uId;
            this.role = role;
            this.memberId = mId;
            this.abandon = false;
        }
    }
}
