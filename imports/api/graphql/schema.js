//inventaireB(type:String!,search:String,date:String,moment:Float,offset:Int,limit:Int):[InvBItem]
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
        PrixUnitaire:Float
        ValBilan:Float
        SGI:String
        Symbole:String
        reference:String
        lastTypeOp:String
        IsFractionned:Boolean
        type:String
    }
    type InvBItem{
        DateAcquisition:String
        Valeur:String
        Quantite:Int
        PrixUnitaire:Float
        ValBilan:Float
        SGI:String
        Symbole:String
        reference:Int
        lastTypeOp:String
        IsFractionned:Boolean
        type:String
        DateInventaire:String
        moment:Float
    }
    type HistoInvItem{
        Date:String
        Valeur:String
        Quantite:Int
        prixVente:Float
        prixAchat:Float
        ValBilan:Float
        PMvalue:Float
        Symbole:String
        ref:Int
        type:String
        typeop:String
    }
    type Query{
        user(username:String):[User]
        inventaire(type:String!,search:String,offset:Int,limit:Int):[InvItem]
        inventaireBack(type:String!,moment:String!,search:String,offset:Int,limit:Int):[InvItem]
        tempinventaire(type:String!,search:String,offset:Int,limit:Int):[InvItem]
        histoFIFO(typeop:String,type:String!,symbole:String):[HistoInvItem]
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