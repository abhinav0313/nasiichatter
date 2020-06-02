public with sharing class ChatterUserController {
    
    /***************** Room Section Starts ****************/
    @AuraEnabled(cacheable=true)
    public static List<GroupRoomWrapper> fetchAllRooms(){
        List<GroupRoomWrapper> grwList = new List<GroupRoomWrapper>();
        for(GroupRoom__c gr : [SELECT id, name, groupIds__c from GroupRoom__c ORDER BY name]){
            GroupRoomWrapper grw = new GroupRoomWrapper(gr);
            grwList.add(grw);
        }
        system.debug('****ROOOOOOM LIST::'+grwList);
        return grwList;
    }

    public class GroupRoomWrapper{
        @AuraEnabled
        public GroupRoom__c gr {get; set;}

        public GroupRoomWrapper(GroupRoom__c room){
            this.gr = room;
        }
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
    public static List<GroupWrapper> fetchAllGroups(){
        List<GroupWrapper> gwList = new List<GroupWrapper>();
        for(CollaborationGroup cg : [select Id, Name, CollaborationType, Description, MemberCount, SmallPhotoUrl, FullPhotoUrl from CollaborationGroup ORDER BY Name]){
            GroupWrapper gw = new GroupWrapper(cg);
            gwList.add(gw);
        }
        return gwList;
    }

    public class GroupWrapper{
        @AuraEnabled
        public CollaborationGroup cg {get; set;}

        @AuraEnabled
        public String groupID {get; set;}

        @AuraEnabled
        public String groupName {get; set;}

        public GroupWrapper(CollaborationGroup cg){
            if(cg!=null){
                this.cg = cg;
                this.groupID = cg.Id;
                this.groupName = cg.Name;
            }
        }

    }
    /***************** Room Section Ends ****************/

    /***************** Group Section Starts ****************/
    @AuraEnabled
    public static String saveTheGroup(String groupName,String description,Boolean type,String title,String body){
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
                ConnectApi.ChatterGroupDetail g = ConnectApi.ChatterGroups.createGroup(null, groupInput);
                
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
    /***************** Group Section Ends ****************/
}
