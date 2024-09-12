import {
  CreateInviteDetails,
  InviteRepository,
  InviteStatus,
  PersistedInvite,
  Uuid,
} from "@/invite/types.d";

class InMemoryInviteRepository implements InviteRepository {
  private invites: Map<Uuid, PersistedInvite>;

  constructor() {
    this.invites = new Map();
  }

  create(createInviteDetails: CreateInviteDetails): PersistedInvite {
    const uuid = crypto.randomUUID();
    const inviteDetails = {
      ...createInviteDetails,
      uuid,
      status: InviteStatus.PENDING,
    };
    this.invites.set(uuid, inviteDetails);
    return inviteDetails;
  }

  async getUsersInvites(userEmail: string): Promise<PersistedInvite[]> {
    return Promise.resolve(
      Array.from(this.invites.values()).filter(
        ({ invitee }) => userEmail === invitee
      )
    );
  }
}

export default InMemoryInviteRepository;
