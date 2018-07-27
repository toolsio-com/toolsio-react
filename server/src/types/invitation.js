export default `

  type InvitedUser {
    id: Int!
    email: String!
    isInvitationAccepted: Boolean!
  }

  type SendInvitationResponse {
    success: Boolean!
    account: Account
    errors: [Error!]
  }

  type Query {
    getInvitedUsers: [InvitedUser!]!
  }

  type Mutation {
    sendInvitation(email: String!): SendInvitationResponse!
  }

`
