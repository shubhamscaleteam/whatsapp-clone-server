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
    createdAt: Date
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
    groupId: GroupData
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
    groupId: ID
    deleted: Boolean
}


input Group {
    userName: String!
    creator:ID
    member:[ID]
}

input messageOfgroup {
    message: String
    userId: ID
    groupId: ID
}


input inputGroupDeleteMessage {
    messageId:[ID]
}

type Query {
   userAllGroup(userId: ID!): [GroupData]
   groupbyId(groupId: ID!):GroupData
   groupAllMessage(groupId: ID!):[GroupAllMessage]
   }

type Mutation {
    createGroupOfUser(input:Group ):GroupData
    createGroupMessage(input:messageOfgroup):GroupMessage
    deleteGroupMessage(input:inputGroupDeleteMessage):DeleteMessage
}

type Subscription {
    groupMessageCreated:GroupMessage
    groupDeleteMessage:DeleteMessage
}

`;
