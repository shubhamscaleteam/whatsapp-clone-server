export default `#graphql

scalar Number
scalar Date

type User {
    id:ID!
    userName: String!
    phoneno:Number!
    email:String!
}

type UserTotalDetails {
    id:ID!
    userName: String!
    phoneno:Number!
    email:String!
    password:String
}

type UserMessage {
    id:ID
    createdAt: Date
    userId:User
    reciverId:User
    message:String
    deleted:Boolean
    deletedBy:User
    isread:Boolean
}

type DeleteMessage {
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
} 

input message {
    createdAt: Date
    userId:ID
    reciverId:ID
    message:String
}

input inputLogin {
    email:String!
    password:String!
} 

input inputDeleteMessage {
    messageId:[ID]
    deletedBy:[ID]
}

input inputNewPassword {
    newPassword:String!
    confirmPassword:String!
}

type Query {
    user(email:String!): User
    userById(id:ID!): User
    allUser: [User]
   userMessage(filter:filterData): [UserMessage]
}

type Mutation {
    registerUser(input: inputRegister!) : User
    loginUser(input: inputLogin!): Token
    createMessage(input:message):UserMessage
    deleteMessage(input:inputDeleteMessage):DeleteMessage
    forgetPassword(email:String!):UserTotalDetails
    newPassword(input:inputNewPassword):UserTotalDetails
}

type Subscription {
    messageCreated:UserMessage
    deleteMessage:DeleteMessage
    readMessage:[UserMessage]
}
`;
