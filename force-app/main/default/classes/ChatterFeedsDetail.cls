public with sharing class ChatterFeedsDetail {

    @AuraEnabled
    public static string saveFeed(String groupId, String message, String mode, String feedId){
        if(groupId!=null && groupId!='' && message!=null && message!=''){
            CollaborationGroup chatterGroup = [select Id from CollaborationGroup where id = :groupId];
            FeedItem post = new FeedItem();
            post.Body = message;
            post.ParentId = chatterGroup.Id;
            if(mode == 'edit'){
                if(feedId!=null && feedId!='')
                    post.Id = feedId;
                else {
                    return 'NoFeedId';   
                }
            }
            upsert post;
            return 'success';
        }
        return null;
    }

    @AuraEnabled
    public static string saveFeedComment(String feedId, String message){
        if(feedId!=null && feedId!='' && message!=null && message!=''){
            FeedComment fc = new FeedComment();
            fc.feedItemId = feedId;
            fc.commentbody = message;
            insert fc;
            return 'success';
        }
        return null;
    }

    @AuraEnabled
    public static List<FeedWrapper> fetchGroupFeed(String groupId){
        List<FeedWrapper> fwList = new List<FeedWrapper>();
        Map<ID, List<FeedComment>> cgf_fcMap = new Map<ID, List<FeedComment>>();

        Map<String,CollaborationGroupFeed> mapCollabGroupFeed = new Map<String,CollaborationGroupFeed>();
        mapCollabGroupFeed = new Map<String,CollaborationGroupFeed>([Select id,Body, Title, Type, InsertedById, CreatedDate From CollaborationGroupFeed where parentid=:groupId ORDER BY CreatedDate Desc LIMIT 100]);
        for(FeedComment fc : [SELECT id, FeedItemId, CommentBody, InsertedById, CreatedDate From FeedComment where FeedItemId=:mapCollabGroupFeed.keySet() ORDER BY CreatedDate LIMIT 50000]){
            if(!cgf_fcMap.containsKey(fc.FeedItemId)){
                cgf_fcMap.put(fc.FeedItemId, new List<FeedComment>());
            }
            cgf_fcMap.get(fc.FeedItemId).add(fc);
        }
        for(ID ide : mapCollabGroupFeed.keySet()){
            fwList.add(new FeedWrapper(mapCollabGroupFeed.get(ide), cgf_fcMap.get(ide)));
        }
        return fwList;
    }

    @AuraEnabled
    public static string deleteFeed(String feedId){
        if(feedID!=null && feedId!=''){
            FeedItem post = new FeedItem();
            post.id = feedId;
            delete post;
            return 'success';
        }
        return null;
    }

    public class FeedWrapper {
        @AuraEnabled
        public CollaborationGroupFeed cgf {get; set;}

        @AuraEnabled
        public List<FeedComment> fcList {get; set;}

        public FeedWrapper(CollaborationGroupFeed groupFeed, List<FeedComment> fcl){
            this.fcList = new List<FeedComment>();
            if(groupFeed!=null)
                this.cgf = groupFeed;
            if(fcl!=null && fcl.size()>0)
                this.fcList.addAll(fcl);
        }
    }
}
