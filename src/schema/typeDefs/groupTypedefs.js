export default `#graphql

scalar Number
scalar Date

type User {
    id:ID!
    userName: String!
    phoneno:Number!
    email:String!
}

type GroupData {
    id: ID
    userName: String
    creator:User
    member:[User]
}

type GroupAllMessage {
    id:ID
    createdAt: Date
    message: String
    userId: User
    reciverId: GroupData
    deleted: Boolean, 
}

type DeleteMessage {
    info:String
}

type GroupMessage {
    id:ID
    createdAt: Date
    message: String
    userId: ID
    reciverId: ID
    deleted: Boolean
    isread:Boolean
}


input Group {
    userName: String!
    creator:ID
    member:[ID]
}

input messageOfgroup {
    message: String
    userId: ID
    reciverId: ID
}

input inputGroupDeleteMessage {
    messageId:[ID]
    deletedBy:[ID]
}

type Query {
   userAllGroup(userId: ID!): [GroupData]
   groupbyId(reciverId: ID!):GroupData
   groupAllMessage(reciverId: ID!,userId:ID):[GroupAllMessage]
   }

type Mutation {
    createGroupOfUser(input:Group):GroupData
    createGroupMessage(input:messageOfgroup):GroupMessage
    deleteGroupMessage(input:inputGroupDeleteMessage):DeleteMessage
}

type Subscription {
    groupMessageCreated:GroupMessage
    groupDeleteMessage:DeleteMessage
}

`;
