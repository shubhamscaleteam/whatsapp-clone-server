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
    createdAt: Date
    message: String
    userId: User
    groupId: GroupData
}

type GroupMessage {
    createdAt: Date
    message: String
    userId: ID
    groupId: ID
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

type Query {
   userAllGroup(userId: ID!): [GroupData]
   groupbyId(groupId: ID!):GroupData
   groupAllMessage(groupId: ID!):[GroupAllMessage]
   }

type Mutation {
    createGroupOfUser(input:Group ):GroupData
    createGroupMessage(input:messageOfgroup):GroupMessage
}

`;
