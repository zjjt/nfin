const schema=`
    type User{
        username:String
        uncrypted:String
        nom:String
        prenoms:String
        fullname: String
        codeRedac:String
        role:String
        createdAt:String
    }
    type Query{
        user(username:String):[User]
    }
    type Mutation{
            deleteUsers(usercodes:[String]!):[User]
        }
    schema{
            query:Query
            mutation:Mutation
        }
`;

export default schema;