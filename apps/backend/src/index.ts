import appFactory from "@/app";
import { InviteCreatedEvent } from "@/invite/create-invite-event-listener";
import { importJWK, KeyLike } from "jose";
import { Subject } from "rxjs";
import { Stage } from "./global";
import resolvePublishInternalEvent from "./resolve-publish-internal-event";

async function initialiseApp() {
  const subject = new Subject<InviteCreatedEvent>();
  const app = appFactory({
    stage: process.env.STAGE as Stage,
    keySet: {
      jwtPrivateKey: (await importJWK(
        JSON.parse(process.env.JWT_PRIVATE_KEY),
        "RS256",
      )) as KeyLike,
      jwtPublicKey: (await importJWK(
        JSON.parse(process.env.JWT_PUBLIC_KEY),
        "RS256",
      )) as KeyLike,
    },
    internalEventPublisher: resolvePublishInternalEvent(subject),
    internalEventSubscriber: subject,
  });

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
  });
}

initialiseApp();
