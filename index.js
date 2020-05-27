const EventsSDK = require('@adobe/aio-lib-events')
const path = require('path')
const ZonedDateTime = require('@js-joda/core').ZonedDateTime
const ZoneOffset = require('@js-joda/core').ZoneOffset
// load .env values in the project folder, if any
require('dotenv').config({ path: path.join(__dirname, '.env') })

const orgId = process.env.EVENTS_ORG_ID
const apiKey = process.env.EVENTS_API_KEY
const accessToken = process.env.EVENTS_JWT_TOKEN
const consumerOrgId = process.env.EVENTS_CONSUMER_ORG_ID
const workspaceId = process.env.EVENTS_WORKSPACE_ID
const projectId = process.env.EVENTS_PROJECT_ID
const integrationId = process.env.EVENTS_INTEGRATION_ID
const httpOptions = { retries: 3 }
const randomNumber = Math.round(Math.random() * 100000)

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function initSDK() {
  return await EventsSDK.init(orgId, apiKey, accessToken, httpOptions)
}

async function createProvider(sdkClient) {
  // create a provider
  provider = await sdkClient.createProvider(consumerOrgId, projectId,
    workspaceId,
    {
      label: 'EventsCodeLab ' + randomNumber,
      organization_id: orgId
    })
  return provider
}

async function createEventMetadata(sdkClient, providerId) {
  // create event metadata
  eventCode = 'com.adobe.events.sdk.event.' + randomNumber
  return await sdkClient.createEventMetadataForProvider(consumerOrgId,
    projectId,
    workspaceId, providerId, {
      event_code: eventCode,
      description: 'test for Events SDK CodeLab',
      label: 'EventsCodeLab ' + randomNumber
    })
}

async function registerJournallingEndpoint(sdkClient, providerId, eventCode) {
  // create journal registration
  journalReg = await sdkClient.createWebhookRegistration(consumerOrgId,
    integrationId, {
      name: 'Test Events SDK Codelab ' + randomNumber,
      description: 'Test Events SDK Codelab ' + randomNumber,
      client_id: apiKey,
      delivery_type: 'JOURNAL',
      events_of_interest: [
        {
          event_code: eventCode,
          provider_id: providerId
        }
      ]
    })
    return journalReg
}

async function fetchJournallingPosition(sdkClient, journallingUrl) {
  // fetch position for next event for journalling
  return await sdkClient.getEventsFromJournal(journallingUrl,
    { })
}

async function publishEvent(sdkClient, providerId, eventCode) {
  // fire event
  const publish = await sdkClient.publishEvent({
    id: 'test-' + randomNumber,
    source: 'urn:uuid:' + providerId,
    time: ZonedDateTime.now(ZoneOffset.UTC).toString(),
    type: eventCode,
    data: {
      test: 'eventsSDKcodelab_' + randomNumber
    }
  })
}

async function receiveEventInJournalling(sdkClient, journalling) {
  var count = 0
  let nextLink = journalling.link.next
  // retry to fetch from journalling 3 times ( 30 seconds )
  while (count < 3 && journalling.retryAfter && journalling.events === undefined) {
    journalling = await sdkClient.getEventsFromJournal(nextLink, { latest: true })
    nextLink = journalling.link.next
    if (journalling.retryAfter) {
      await sleep(journalling.retryAfter)
    }
    count = count + 1
  }
  return journalling.events
}

async function deleteJournalRegistration(sdkClient, journalRegId) {
  await sdkClient.deleteWebhookRegistration(consumerOrgId,
    integrationId, journalRegId)
}

async function deleteEventMetadata(sdkClient, providerId) {
  await sdkClient.deleteAllEventMetadata(consumerOrgId, projectId,
    workspaceId, providerId)
}

async function deleteProvider(sdkClient, providerId) {
  await sdkClient.deleteProvider(consumerOrgId, projectId, workspaceId,
    providerId)
}

const run = async () => {
  let sdkClient = await initSDK()
  
  console.log("create event provider")
  let provider = await createProvider(sdkClient)
  let eventMetadata = await createEventMetadata(sdkClient, provider.id)
  let journalReg = await registerJournallingEndpoint(sdkClient, provider.id, eventMetadata.event_code)

  console.log("event provider id: " + provider.id)
  console.log("event code: " + eventMetadata.event_code)
  console.log("journal registration id: " + journalReg.registration_id)
  console.log("event url: " + journalReg.events_url)
};

run();
