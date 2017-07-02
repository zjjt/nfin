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
    type InvItem{
        DateAcquisition:String
        Valeur:String
        Quantite:Int
        PrixUnitaire:Int
        ValBilan:Int
        SGI:String
        Symbole:String
        reference:Int
        lastTypeOp:String
        IsFractionned:Boolean
        type:String
    }
    type Query{
        user(username:String):[User]
        inventaire(type:String!,search:String,offset:Int,limit:Int):[InvItem]
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