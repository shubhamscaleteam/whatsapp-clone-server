export default `#graphql

scalar Number
scalar Date

type User {
    id:ID!
    userName: String!
    phoneno:Number!
    email:String!
    profilePicture:String
}

type UserTotalDetails {
    id:ID
    userName: String
    phoneno:Number
    email:String
    password:String
}

type UserMessage {
    id:ID
    createdAt: Date
    userId:UserTotalDetails
    reciverId:[UserTotalDetails]
    message:String
    deleted:Boolean
    deletedBy:User
    deletedFrom:User
    isread:Boolean
    isForward:Boolean
}

type DeleteMessage {
    info:String
}

type forwardInfo {
    info:String
} 

input filterData {
    userId:ID
    reciverId:ID
}

type Token {
    token: String!
}

input inputRegister {
    userName: String!
    phoneno:Number!
    email:String!
    password:String!
    profilePicture:String!
} 

input message {
    userId:ID
    reciverId:[ID]
    message:String
}

input inputLogin {
    email:String!
    password:String!
} 

input inputDeleteMessage {
    messageId:[ID]
    deletedBy:[ID]
    deletedFrom:ID
}

input updateProfile {
    id:ID!
    userName:String
    profilePicture:String
}

input inputNewPassword {
    newPassword:String!
    confirmPassword:String!
}

input ForwardMessage {
    message:String
    userId:ID
    reciverId:[ID]
    groupId:[ID]
}

type Query {
    user(email:String!): User
    userById(id:ID!): User
    allUser: [User]
   userMessage(filter:filterData): [UserMessage]
   singleMessage(id:ID):UserMessage
}

type Mutation {
    registerUser(input: inputRegister!) : User
    updateUserProfile(input:updateProfile): User
    loginUser(input: inputLogin!): Token
    createMessage(input:message):UserMessage
    deleteMessage(input:inputDeleteMessage):DeleteMessage
    forgetPassword(email:String!):UserTotalDetails
    newPassword(input:inputNewPassword, token:String):UserTotalDetails
    forwardMessage(input:ForwardMessage):forwardInfo
}

type Subscription {
    updateUserProfile:User
    messageCreated:UserMessage
    deleteMessage:DeleteMessage
    readMessage:[UserMessage]
    fwardMessage:forwardInfo
}
`;
