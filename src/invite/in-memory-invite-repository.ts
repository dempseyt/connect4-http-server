import {
  CreateInviteDetails,
  InviteRepository,
  PersistedInvite,
} from "./invite-repository.d";
import { InviteStatus } from "./invite-service-types.d";

class InMemoryInviteRepository implements InviteRepository {
  create(createInviteDetails: CreateInviteDetails): PersistedInvite {
    const uuid = crypto.randomUUID();
    return {
      ...createInviteDetails,
      uuid,
      status: InviteStatus.PENDING,
    };
  }
}

export default InMemoryInviteRepository;
