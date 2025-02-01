# Requirements Organization

## SP5-SI-AIRC2 -> Air C2 Information Exchange

### SP5-TIN-344 -> MTF Exchange - Air Tasking and Control Consumer

#### SP5-SREQ-1140 -> Air Tasking and Control - Data Exchange - MNPs shall be able to exchange Formatted Text Messages (built from the rules contained in ADatP-3).

#### SP5-SREQ-1296 -> Need-to-know for ATO and ACO MTF messages shall be managed based on their respective releasability label.



### SP5-TIN-344 -> MTF Exchange - Air Tasking and Control Provider

#### SP5-SREQ-1140 -> Air Tasking and Control - Data Exchange - MNPs shall be able to exchange Formatted Text Messages (built from the rules contained in ADatP-3).

#### SP5-SREQ-1296 -> Need-to-know for ATO and ACO MTF messages shall be managed based on their respective releasability label.



## SP5-SI-AV -> Audio and Video-based Collaboration

### SP5-TIN-119 -> Push-To-Talk Tactical Voice Collaborator

#### SP5-SREQ-1192 -> MELPe 2400bps must be used as codec for the IP voice stream and they must be included in the RTP payload according to RFC 8130

#### SP5-SREQ-1193 -> The IOP-HD shall use VARC-based half-duplex PTT control

#### SP5-SREQ-1195 -> The destination address of the voice packets must be IPv4

#### SP5-SREQ-1196 -> The identified voice stream must be mapped to the internal PTT voice service of the radio

#### SP5-SREQ-1197 -> Each voice group must be backed by a specific voice channel of the radio

#### SP5-SREQ-1198 -> Destination addresses for the received voice stream for each voice group within the radio must be configured statically according to national considerations as part of the voice group configuration.

#### SP5-SREQ-1199 -> Pre-emption of voice streams must be based on the source IP-address and/or the QoS marking of the IP-packets containing the respective voice stream.

#### SP5-SREQ-1219 -> Each voice group within the radios must be addressed via a combination of IP address, UDP port.

#### SP5-SREQ-1220 -> A radio as well as a client / intercom must accept any number of MELPe frames in a single RTP packet. The size of an RTP packet must never exceed the MTU of an IP packet.

#### SP5-SREQ-1221 -> The Radio IP Access function must either be embedded on the same radio device or via an external adapter.

#### SP5-SREQ-1222 -> Each platform must not have more than one active radio channel/line per radio network.



### SP5-TIN-142 -> Push-To-Talk Tactical Voice Relay Collaborator

#### SP5-SREQ-1223 -> Every radio of the relay platform taking part in the relay functionality must be be configured with the same IPv4 multicast address and port of the Tactical Voice Service

#### SP5-SREQ-1224 -> Relaying must not be performed between more than two radio networks

#### SP5-SREQ-1225 -> There must not be more than one platform acting as relay between two particular radio networks

#### SP5-SREQ-1265 -> When a PTT button at a radio is pressed, the radio must also send the the voice stream onto the platform network (to the local client / intercom and the other radio).



### SP5-TIN-181 -> Call Signaling Collaborator

#### SP5-SREQ-1299 -> Call establishment with initial SIP INVITE shall contain SDP element describing the codec information

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012009 -> VTC call - Peer-to-MCU (NOT IN SP5 TIN)

- TCA-CIAV-012016 -> Voice Call - Audio

- TCA-CIAV-012020 -> Media - Local Conference Call - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012035 -> Media - Local Caller Identification - Audio

- TCA-CIAV-012042 -> Provision of Conference Server - Video

- TCA-CIAV-012043 -> Provision of terminals - Consumer-Audio

- TCA-CIAV-012044 -> Provision of Conference Service - Audio

#### SP5-SREQ-1305 -> SDP content shall be limited to the codecs that are listed in JMEI

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012009 -> VTC call - Peer-to-MCU (NOT IN SP5 TIN)

- TCA-CIAV-012010 -> VTC Cascading - Conference Server-to-Conference Server - Video (NOT IN SP5 TIN)

- TCA-CIAV-012016 -> Voice Call - Audio

- TCA-CIAV-012020 -> Media - Local Conference Call - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012035 -> Media - Local Caller Identification - Audio

- TCA-CIAV-012042 -> Provision of Conference Server - Video

- TCA-CIAV-012043 -> Provision of terminals - Consumer-Audio

- TCA-CIAV-012044 -> Provision of Conference Service - Audio

#### SP5-SREQ-207 -> Session Initiation Protocol (SIP) signalling shall only flow between SBCs.

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012008 -> Media - Remote Call Transfer - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012010 -> VTC Cascading - Conference Server-to-Conference Server - Video (NOT IN SP5 TIN)

- TCA-CIAV-012011 -> Video Call - Video

- TCA-CIAV-012012 -> Media - Remote Conference Call - Video

- TCA-CIAV-012013 -> Media - Remote Call Transfer (External) - Audio

- TCA-CIAV-012015 -> Media - Remote Caller Identification - Video

- TCA-CIAV-012017 -> Media - Remote Caller Identification - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012018 -> Media - Remote Conference Call - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012021 -> Call Signaling - SIP(S) - Audio



### SP5-TIN-182 -> Media Exchange Collaborator

#### SP5-SREQ-1306 -> SBCs shall not transcode media within RTP streams

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012011 -> Video Call - Video

- TCA-CIAV-012016 -> Voice Call - Audio

#### SP5-SREQ-208 -> The establishment media streams across the NIP shall be performed in hop-by-hop or edge-to-edge mode, depending on the specific requirements of the mission.

- TCA-CIAV-012005 -> SBC SIP connections up and running

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012008 -> Media - Remote Call Transfer - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012010 -> VTC Cascading - Conference Server-to-Conference Server - Video (NOT IN SP5 TIN)

- TCA-CIAV-012012 -> Media - Remote Conference Call - Video

- TCA-CIAV-012013 -> Media - Remote Call Transfer (External) - Audio

- TCA-CIAV-012015 -> Media - Remote Caller Identification - Video

- TCA-CIAV-012017 -> Media - Remote Caller Identification - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012018 -> Media - Remote Conference Call - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012039 -> Media - Network Topology



### SP5-TIN-183 -> Call Routing Collaborator

#### SP5-SREQ-1297 -> Media prefixes shall be coded in to the IPv6 routes with IP next-hop indicating call routing next hop and Route Target community indicating originator SBC information

#### SP5-SREQ-1298 -> SBCs supporting dynamic voice routing shall implement BGP routing for exchange ST4705 media prefixes.

#### SP5-SREQ-1308 -> SBCs shall support call routing based on the variable length prefix

#### SP5-SREQ-1309 -> SBC shall support STANAG4705 prefix structure.

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012016 -> Voice Call - Audio

- TCA-CIAV-012022 -> Dial plan on Registration Servers - Video (duplicate as SBC only exist also)

- TCA-CIAV-012023 -> Media - Call Routing - Static - Audio

- TCA-CIAV-012028 -> Dial plan on Session Border Controllers - Video

- TCA-CIAV-012034 -> Dial plan on Session Border Controllers - Audio

- TCA-CIAV-012037 -> Media - Call Routing - Static - Video

#### SP5-SREQ-1310 -> SBCs shall support National Address Space and Theatre Address Space in routing of calls.

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012023 -> Media - Call Routing - Static - Audio

- TCA-CIAV-012028 -> Dial plan on Session Border Controllers - Video

- TCA-CIAV-012034 -> Dial plan on Session Border Controllers - Audio

- TCA-CIAV-012037 -> Media - Call Routing - Static - Video

#### SP5-SREQ-209 -> By default, call routing shall be configured to use statically configured prefixes.

- TCA-CIAV-012005 -> SBC SIP connections up and running

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012008 -> Media - Remote Call Transfer - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012009 -> VTC call - Peer-to-MCU (NOT IN SP5 TIN)

- TCA-CIAV-012010 -> VTC Cascading - Conference Server-to-Conference Server - Video (NOT IN SP5 TIN)

- TCA-CIAV-012011 -> Video Call - Video

- TCA-CIAV-012012 -> Media - Remote Conference Call - Video

- TCA-CIAV-012013 -> Media - Remote Call Transfer (External) - Audio

- TCA-CIAV-012015 -> Media - Remote Caller Identification - Video

- TCA-CIAV-012016 -> Voice Call - Audio

- TCA-CIAV-012017 -> Media - Remote Caller Identification - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012018 -> Media - Remote Conference Call - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012028 -> Dial plan on Session Border Controllers - Video

- TCA-CIAV-012034 -> Dial plan on Session Border Controllers - Audio

- TCA-CIAV-012037 -> Media - Call Routing - Static - Video

#### SP5-SREQ-218 -> Service providers shall configure call routing on Session Border Controllers.

- TCA-CIAV-012005 -> SBC SIP connections up and running

- TCA-CIAV-012007 -> Traffic flow between SBC

- TCA-CIAV-012008 -> Media - Remote Call Transfer - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012010 -> VTC Cascading - Conference Server-to-Conference Server - Video (NOT IN SP5 TIN)

- TCA-CIAV-012011 -> Video Call - Video

- TCA-CIAV-012012 -> Media - Remote Conference Call - Video

- TCA-CIAV-012013 -> Media - Remote Call Transfer (External) - Audio

- TCA-CIAV-012015 -> Media - Remote Caller Identification - Video

- TCA-CIAV-012016 -> Voice Call - Audio

- TCA-CIAV-012017 -> Media - Remote Caller Identification - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012018 -> Media - Remote Conference Call - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012023 -> Media - Call Routing - Static - Audio

- TCA-CIAV-012028 -> Dial plan on Session Border Controllers - Video

- TCA-CIAV-012034 -> Dial plan on Session Border Controllers - Audio

- TCA-CIAV-012037 -> Media - Call Routing - Static - Video



### SP5-TIN-187 -> Multi-Level Precedence and Pre-emption Collaborator

#### SP5-SREQ-210 -> Media services on the mission network must implement Call Admission Control (CAC) to constrain the number of media streams that can be supported.

- TCA-CIAV-012014 -> Check CAC limitation (Audio)

- TCA-CIAV-012019 -> Check CAC limitation (Video)

- TCA-CIAV-012038 -> The Service Management Authority shall coordinate and publish the CAC policies of the participating service providers

#### SP5-SREQ-211 -> Service providers must implement a mechanism that ensures the availability of adequate resources for high priority media streams (MLPP).

- TCA-CIAV-012026 -> Multi-Level Precedence and Pre-emption (MLPP) - Video

- TCA-CIAV-012031 -> Multi-Level Precedence and Pre-emption (MLPP) - Audio



### SP5-TIN-198 -> Media Infrastructure Security Collaborator

#### SP5-SREQ-1300 -> SIP signaling between SBCs shall be secured with TLS

- TCA-CIAV-017247 -> SBC SIP TLS connections (CHECK THIS FIRST)

#### SP5-SREQ-1301 -> SIP signaling and RTP media between SBCs shall be secured with IPsec tunnel

#### SP5-SREQ-1302 -> RTP media between SBCs shall be secured with SRTP



### SP5-TIN-365 -> Audio/Video Media Infrastructure Collaborator

#### SP5-SREQ-1230 -> A/V conference servers shall be reachable by STANAG 4705 numbers.

- TCA-CIAV-012020 -> Media - Local Conference Call - Audio (NOT IN SP5 TIN)

- TCA-CIAV-012030 -> Media - Local Conference Call - Video (NO TIN in SP5)

#### SP5-SREQ-216 -> Service providers shall provide at least one Session Border Controller.

#### SP5-SREQ-219 -> Service providers shall provide at least one audio conference server.

- TCA-CIAV-012020 -> Media - Local Conference Call - Audio (NOT IN SP5 TIN)

#### SP5-SREQ-430 -> Service Providers shall provide at least one video conference server.

- TCA-CIAV-012030 -> Media - Local Conference Call - Video (NO TIN in SP5)



### SP5-TIN-375 -> End-to-End Media Security Collaborator

#### SP5-SREQ-1303 -> Signaling and media between audio/video end-points shall be secured with SCIP

#### SP5-SREQ-1304 -> SCIP shall signal call on underlying media infrastructure with one of the codecs listed in the mission network JMEI



## SP5-SI-CALENDAR -> Calendaring and Scheduling

### SP5-TIN-13 -> Calendar Dissemination Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.



### SP5-TIN-14 -> Event Scheduling Consumer

#### SP5-SREQ-459 -> A Service Consumer shall allow a calendar user to receive events from other calendar users.

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-460 -> A Service Consumer shall allow a calendar user to display events.

- TCA-CIAV-012784 -> REPO-02919-Calendar is read-only

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-461 -> A Service Consumer shall allow a calendar user to respond to the event invitation.

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-485 -> An Event shall always specify the time zone as part of the event information.

- TCA-CIAV-014440 -> Calendar-event related functionalities



### SP5-TIN-14 -> Event Scheduling Provider

#### SP5-SREQ-454 -> A Service Provider shall allow a calendar user to create an event.

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-455 -> A Service Provider shall allow a calendar user to update the event.

- TCA-CIAV-012784 -> REPO-02919-Calendar is read-only

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-456 -> A Service Provider shall allow a calendar user to cancel the event.

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-457 -> A Service Provider shall allow a calendar user to invite attendees to the event.

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-458 -> A Service Provider shall allow a calendar user to send an event to other users.

- TCA-CIAV-014440 -> Calendar-event related functionalities

#### SP5-SREQ-485 -> An Event shall always specify the time zone as part of the event information.

- TCA-CIAV-014440 -> Calendar-event related functionalities



### SP5-TIN-367 -> Calendar Exchange via Web Hosting Mediator

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-013927 -> Calendar sharing and functionalities via Web Hosting

- TCA-CIAV-013927 -> Calendar sharing and functionalities via Web Hosting - SP5

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

#### SP5-SREQ-462 -> A Service Provider shall allow a calendar user’s calendar to be published via Web Hosting Services.

- TCA-CIAV-012784 -> REPO-02919-Calendar is read-only

- TCA-CIAV-013927 -> Calendar sharing and functionalities via Web Hosting

- TCA-CIAV-013927 -> Calendar sharing and functionalities via Web Hosting - SP5

- TCA-CIAV-017447 -> Publish a calendar on the Web Server

#### SP5-SREQ-463 -> A Service Consumer shall allow a calendar user’s calendar to be retrieved.

- TCA-CIAV-012784 -> REPO-02919-Calendar is read-only

- TCA-CIAV-013927 -> Calendar sharing and functionalities via Web Hosting

- TCA-CIAV-013927 -> Calendar sharing and functionalities via Web Hosting - SP5

- TCA-CIAV-017447 -> Publish a calendar on the Web Server



### SP5-TIN-368 -> Calendar Exchange via Email Mediator

#### SP5-SREQ-1232 -> A Service Provider shall allow a calendar user’s calendar to be disseminated via Informal Messaging services.

- TCA-CIAV-012784 -> REPO-02919-Calendar is read-only

- TCA-CIAV-017425 -> Calendar sharing and functionalities via Email

- TCA-CIAV-017425 -> Calendar sharing and functionalities via Email- SP5

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

#### SP5-SREQ-463 -> A Service Consumer shall allow a calendar user’s calendar to be retrieved.

- TCA-CIAV-012784 -> REPO-02919-Calendar is read-only

- TCA-CIAV-017425 -> Calendar sharing and functionalities via Email

- TCA-CIAV-017425 -> Calendar sharing and functionalities via Email- SP5



## SP5-SI-CHAT -> Text-based Collaboration

### SP5-TIN-122 -> Presence Sharing Consumer

#### SP5-SREQ-1233 -> If enabled, the presence function shall use allowed values "away", "chat" (default), "dnd" or "xa".



### SP5-TIN-122 -> Presence Sharing Provider

#### SP5-SREQ-1233 -> If enabled, the presence function shall use allowed values "away", "chat" (default), "dnd" or "xa".

- TCA-CIAV-017408 -> NEW - REPO-00160-Presence Indicator

#### SP5-SREQ-130 -> All Mission Network contributing participants shall provide the following capabilities to their users: Instant Messaging, Presence Indicator and Contact Lists.

- TCA-CIAV-017408 -> NEW - REPO-00160-Presence Indicator

- TCA-CIAV-017498 -> NEW - REPO-00064-Contact Lists - Adding Remote Contacts within a Chat Client

#### SP5-SREQ-604 -> Each user of a Text-based Collaboration service shall be identifiable using a full JID in the form of "username@domainpart/resource".

- TCA-CIAV-017402 -> NEW - REPO-00604-User must Display FULL JID

- TCA-CIAV-017410 -> NEW - REPO-00587-JIDS available to all Users



### SP5-TIN-124 -> Information Discovery Collaborator

#### SP5-SREQ-1267 -> Users shall be able to list available chat rooms hosted on federated chat services.

#### SP5-SREQ-130 -> All Mission Network contributing participants shall provide the following capabilities to their users: Instant Messaging, Presence Indicator and Contact Lists.

- TCA-CIAV-017421 -> NEW - REPO-00061-Contact Lists - Adding Groups and Contacts to the Client Contact List

#### SP5-SREQ-604 -> Each user of a Text-based Collaboration service shall be identifiable using a full JID in the form of "username@domainpart/resource".

- TCA-CIAV-017402 -> NEW - REPO-00604-User must Display FULL JID



### SP5-TIN-127 -> Exchange of Data Forms Collaborator

#### SP5-SREQ-260 -> The Form Exchange functionality shall provide the exchange of structured data via data forms.

- TCA-CIAV-017097 -> Event Recording and Dissemination Process - Chat Collaboration Pub/Sub

- TCA-CIAV-017411 -> NEW - REPO-03647-Structured forms within the chat client

- TCA-CIAV-017503 -> NEW - REPO-05431-Structured forms within the chat client (Federated)

#### SP5-SREQ-261 -> Data Forms shall be discoverable

- TCA-CIAV-017411 -> NEW - REPO-03647-Structured forms within the chat client

- TCA-CIAV-017503 -> NEW - REPO-05431-Structured forms within the chat client (Federated)



### SP5-TIN-138 -> Instant Messaging Collaborator

#### SP5-SREQ-1234 -> XMPP stanzas shall be labeled with security policies and confidentiality metadata following ADatP-4774.

- TCA-CIAV-017396 -> NEW - REPO-05433-Security Labeling

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017480 -> NEW - REPO-05456-Messages are properly labeled in chat rooms

#### SP5-SREQ-1235 -> XMPP stanzas shall be bound to confidentiality information labels following ADatP-4778.

- TCA-CIAV-017396 -> NEW - REPO-05433-Security Labeling

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017480 -> NEW - REPO-05456-Messages are properly labeled in chat rooms

#### SP5-SREQ-130 -> All Mission Network contributing participants shall provide the following capabilities to their users: Instant Messaging, Presence Indicator and Contact Lists.

- TCA-CIAV-017366 -> NEW - REPO-00127-Private Chat 

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017504 -> NEW - REPO-00050-Participate in conversation on a federated server

#### SP5-SREQ-131 -> Within the Mission Network, all server to server connections must support the dialback protocol.

- TCA-CIAV-017458 -> NEW - REPO-00227-Partner certificates are trusted

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-017458 -> NEW - REPO-00227-Partner certificates are trusted

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-313 -> Event logs must include full accounting of chat rooms, including: room title; all messages including timestamps and classifications; user access; and administrator actions.

- TCA-CIAV-017403 -> NEW - REPO-00232-Room History Logging

- TCA-CIAV-017414 -> NEW - REPO-00028-Client Date Time Format and Timezone - Chat Client

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017501 -> NEW - REPO-00489-Room Logging (Federated)

#### SP5-SREQ-377 -> If a stanza carries a label, the labels shall be made visible to the user.

- TCA-CIAV-017366 -> NEW - REPO-00127-Private Chat 

- TCA-CIAV-017396 -> NEW - REPO-05433-Security Labeling

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017480 -> NEW - REPO-05456-Messages are properly labeled in chat rooms

- TCA-CIAV-017489 -> NEW - REPO-00622-Private / Whisper - Chat Client

- TCA-CIAV-017504 -> NEW - REPO-00050-Participate in conversation on a federated server

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-017458 -> NEW - REPO-00227-Partner certificates are trusted

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-52 -> Message content shall be preserved.

- TCA-CIAV-017096 -> Event Recording and Dissemination Process - Chat

- TCA-CIAV-017403 -> NEW - REPO-00232-Room History Logging

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-59 -> All (item-structured) IQ and message stanzas shall be labelled with the classification of the message content.

- TCA-CIAV-017396 -> NEW - REPO-05433-Security Labeling

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017480 -> NEW - REPO-05456-Messages are properly labeled in chat rooms

#### SP5-SREQ-604 -> Each user of a Text-based Collaboration service shall be identifiable using a full JID in the form of "username@domainpart/resource".

- TCA-CIAV-017402 -> NEW - REPO-00604-User must Display FULL JID

- TCA-CIAV-017410 -> NEW - REPO-00587-JIDS available to all Users

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017497 -> NEW - REPO-00340-JIDS visible to Moderators only

- TCA-CIAV-017504 -> NEW - REPO-00050-Participate in conversation on a federated server

- TCA-CIAV-017508 -> NEW - REPO-00130-JIDS available to all Users

#### SP5-SREQ-61 -> User access to chat shall be authenticated.

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-63 -> If user authentication is not integrated with local MNP domain identity and access management solution, secure log-on shall be enforced for user authentication.

- TCA-CIAV-017409 -> NEW - REPO-04707-No Integrated User Authentication - Secure Log-on shall be enforced

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-64 -> Events shall be logged by all chat servers.

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-65 -> Event logs must include, where relevant: user IDs; dates, times and details of key events; and administrator actions.

- TCA-CIAV-017414 -> NEW - REPO-00028-Client Date Time Format and Timezone - Chat Client

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-66 -> Communication between chat servers shall be secured via TLS with mutual authentication.

- TCA-CIAV-017415 -> NEW - REPO-00393-TLS for XMPP Clients

- TCA-CIAV-017428 -> NEW - REPO-03505-Transport Layer Security Profile

- TCA-CIAV-017458 -> NEW - REPO-00227-Partner certificates are trusted

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-67 -> All file transfers shall be blocked.

- TCA-CIAV-017404 -> NEW - REPO-05432-All file transfers shall be blocked

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-85 -> Complete instant messaging dialogs with time-stamps shall be preserved.

- TCA-CIAV-017403 -> NEW - REPO-00232-Room History Logging

- TCA-CIAV-017414 -> NEW - REPO-00028-Client Date Time Format and Timezone - Chat Client

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017489 -> NEW - REPO-00622-Private / Whisper - Chat Client

- TCA-CIAV-017501 -> NEW - REPO-00489-Room Logging (Federated)

- TCA-CIAV-017504 -> NEW - REPO-00050-Participate in conversation on a federated server



### SP5-TIN-141 -> Publish-Subscribe Collaborator

#### SP5-SREQ-131 -> Within the Mission Network, all server to server connections must support the dialback protocol.

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

#### SP5-SREQ-313 -> Event logs must include full accounting of chat rooms, including: room title; all messages including timestamps and classifications; user access; and administrator actions.

#### SP5-SREQ-52 -> Message content shall be preserved.

- TCA-CIAV-017097 -> Event Recording and Dissemination Process - Chat Collaboration Pub/Sub

#### SP5-SREQ-59 -> All (item-structured) IQ and message stanzas shall be labelled with the classification of the message content.

#### SP5-SREQ-64 -> Events shall be logged by all chat servers.

#### SP5-SREQ-65 -> Event logs must include, where relevant: user IDs; dates, times and details of key events; and administrator actions.

#### SP5-SREQ-66 -> Communication between chat servers shall be secured via TLS with mutual authentication.

#### SP5-SREQ-67 -> All file transfers shall be blocked.

- TCA-CIAV-017404 -> NEW - REPO-05432-All file transfers shall be blocked

#### SP5-SREQ-85 -> Complete instant messaging dialogs with time-stamps shall be preserved.



### SP5-TIN-244 -> Group Messaging Consumer

#### SP5-SREQ-150 -> The service shall warn the user that the chat conversations are logged.

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017490 -> NEW - REPO-00625-Users can view Room Subject

#### SP5-SREQ-383 -> Complete multi-user chat rooms with time-stamps shall be preserved.

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017490 -> NEW - REPO-00625-Users can view Room Subject

- TCA-CIAV-017501 -> NEW - REPO-00489-Room Logging (Federated)



### SP5-TIN-244 -> Group Messaging Provider

#### SP5-SREQ-133 -> Chat room management functionality shall support the creation and management of the following room types: public vs. hidden, persistent, password-protected vs. unsecured, members-only vs. open, moderated vs. unmoderated and semi-anonymous vs. non-anonymous rooms

- TCA-CIAV-017398 -> NEW - REPO-00365-Create a password protected room

- TCA-CIAV-017400 -> NEW - REPO-00121-XMPP Admin can create and manage  Members Only Room

- TCA-CIAV-017401 -> NEW- REPO-00205-Create and manage the Banned user list

- TCA-CIAV-017405 -> NEW - REPO-00346-XMPP Admin can create a room with default settings

- TCA-CIAV-017406 -> NEW - REPO-00162-XMPP Admin creates a Hidden room

- TCA-CIAV-017407 -> NEW - REPO-00506-XMPP Admin can create a Moderated room

- TCA-CIAV-017410 -> NEW - REPO-00587-JIDS available to all Users

- TCA-CIAV-017413 -> NEW - REPO-00267-User who is a Room Moderator is able to change the room subject

- TCA-CIAV-017416 -> NEW - REPO-00213-JIDS available to Moderators only

- TCA-CIAV-017419 -> NEW - REPO-00190-Remove participants

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017504 -> NEW - REPO-00050-Participate in conversation on a federated server

#### SP5-SREQ-134 -> Chat room management functionality shall be available which allows users to request membership in a room.

- TCA-CIAV-017399 -> NEW - REPO-00183-Manage the Members List of a members-only room

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-135 -> Chat room management functionality shall be available which allows occupants to view an occupant's full JID in a non-anonymous room.

- TCA-CIAV-017410 -> NEW - REPO-00587-JIDS available to all Users

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017508 -> NEW - REPO-00130-JIDS available to all Users

#### SP5-SREQ-136 -> Chat room management functionality shall be available which allows moderators to view an occupant's full JID in a semi-anonymous room.

- TCA-CIAV-017416 -> NEW - REPO-00213-JIDS available to Moderators only

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017497 -> NEW - REPO-00340-JIDS visible to Moderators only

- TCA-CIAV-017508 -> NEW - REPO-00130-JIDS available to all Users

#### SP5-SREQ-137 -> Chat room management functionality shall be available which allows only moderators to change the room subject.

- TCA-CIAV-017412 -> NEW - REPO-00075-User who is not a Room Moderator is not able to change the room subject

- TCA-CIAV-017413 -> NEW - REPO-00267-User who is a Room Moderator is able to change the room subject

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017490 -> NEW - REPO-00625-Users can view Room Subject

#### SP5-SREQ-138 -> Chat room management functionality shall be available which allows moderators to remove participants and visitors from the room.

- TCA-CIAV-017419 -> NEW - REPO-00190-Remove participants

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-139 -> Chat room management functionality shall be available which allows moderators to grant and revoke voice (i.e., the privilege to speak) in a moderated room, and to manage the voice list.

- TCA-CIAV-017401 -> NEW- REPO-00205-Create and manage the Banned user list

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-140 -> Chat room management functionality shall be available which allows admins to grant and revoke moderator status, and to manage the moderator list.

- TCA-CIAV-017399 -> NEW - REPO-00183-Manage the Members List of a members-only room

- TCA-CIAV-017407 -> NEW - REPO-00506-XMPP Admin can create a Moderated room

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-141 -> Chat room management functionality shall be available which allows admins to ban users from the room, and to manage a ban list.

- TCA-CIAV-017401 -> NEW- REPO-00205-Create and manage the Banned user list

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-142 -> Chat room management functionality shall be available which allows admins to grant and revoke membership privileges, and to manage the member list for a members-only room.

- TCA-CIAV-017399 -> NEW - REPO-00183-Manage the Members List of a members-only room

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-144 -> Chat room management functionality shall be available which allows owners to specify other owners.

- TCA-CIAV-017399 -> NEW - REPO-00183-Manage the Members List of a members-only room

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-145 -> Chat room management functionality shall be available which allows owners to grant and revoke admin status, and to manage the admin list.

- TCA-CIAV-017399 -> NEW - REPO-00183-Manage the Members List of a members-only room

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-146 -> Chat room management functionality shall be available which allows owners to destroy the room.

- TCA-CIAV-017399 -> NEW - REPO-00183-Manage the Members List of a members-only room

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-150 -> The service shall warn the user that the chat conversations are logged.

- TCA-CIAV-017418 -> NEW - REPO-00397-Rooms Archiving

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-383 -> Complete multi-user chat rooms with time-stamps shall be preserved.

- TCA-CIAV-017403 -> NEW - REPO-00232-Room History Logging

- TCA-CIAV-017418 -> NEW - REPO-00397-Rooms Archiving

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

#### SP5-SREQ-605 -> Chat room management functionality shall be available which allows users to view the room subject.

- TCA-CIAV-017397 -> NEW - REPO-03374-Allow users to view Room Subject

- TCA-CIAV-017465 -> Request for Information Responses - Text-based Collaboration (IER-76)

- TCA-CIAV-017490 -> NEW - REPO-00625-Users can view Room Subject



### SP5-TIN-250 -> One-to-one Messaging Collaborator

#### SP5-SREQ-1266 -> Users shall be able to send private messages to other users.

- TCA-CIAV-017096 -> Event Recording and Dissemination Process - Chat

- TCA-CIAV-017366 -> NEW - REPO-00127-Private Chat 

- TCA-CIAV-017489 -> NEW - REPO-00622-Private / Whisper - Chat Client



## SP5-SI-COMMS -> Communications

### SP5-TIN-106 -> Consumer to Provider Inter-domain Multicast Signalling Consumer

#### SP5-SREQ-1202 -> Federated Communications Services Consumer shall not transit any multicast traffic.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile



### SP5-TIN-106 -> Consumer to Provider Inter-domain Multicast Signalling Provider

#### SP5-SREQ-1118 -> PIM multicast group signalling shall be filtered based on mission network allowed multicast groups.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017374 -> REPO-00525-Multicast group filtering must be applied - SP5



### SP5-TIN-107 -> Consumer to Provider Inter-domain Routing Consumer

#### SP5-SREQ-1204 -> MIssion Network Communications Consumer shall not transit any unicast traffic.



### SP5-TIN-107 -> Consumer to Provider Inter-domain Routing Provider

#### SP5-SREQ-1201 -> Consumer to Provider routing shall be operated either using static routing or BGP



### SP5-TIN-112 -> Communications Service Consumer Interface Provider

#### SP5-SREQ-1205 -> Service provider shall forward consumer communications service traffic transparently

- TCA-CIAV-016944 -> Consumer - Check remote server communications

- TCA-CIAV-016966 -> Consumer - Check remote server communications

- TCA-CIAV-017146 -> 3500: REPO-00453-MNP verifies connection to other MNP(s)

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-012045 -> QoS parameters for Audio

- TCA-CIAV-012940 -> QoS parameters for Video

- TCA-CIAV-014490 -> QoS Profile - Tagging Resolver Traffic

- TCA-CIAV-016746 -> REPO-00454-[QoS] Handling of Unknown DSCP values - SP5

- TCA-CIAV-017146 -> 3500: REPO-00453-MNP verifies connection to other MNP(s)

- TCA-CIAV-017331 -> 2.64.4 - Local Identity Provider (IdP) must configure Quality of Service (QoS)

- TCA-CIAV-017331 -> Local Identity Provider (IdP) must configure Quality of Service (QoS)

- TCA-CIAV-017394 -> REPO-02916-[QoS] Service Class Bandwith reservation - SP5

- TCA-CIAV-017395 -> REPO-02917-[Qos] Prioritization of latency sensitive services - SP5



### SP5-TIN-151 -> Exchange of data packets between attached IP networks across Tactical Radio Network Provider

#### SP5-SREQ-1274 -> Data services using this TIN must be conservative in their use of bandwidth and congestion control approaches (e.g. use UDP rather than TCP).

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-017389 -> REPO-00107- [NIP-CC][Tactical Network] Commercial IPSec Encryption  - SP5



### SP5-TIN-162 -> Inter-domain Routing Collaborator

#### SP5-SREQ-1102 -> Route import filtering for BGP must be implemented to prevent direct propagation of Service Provider internal routing protocol routes to the MN routing.

- TCA-CIAV-017378 -> REPO-00363-BGP routes aggretation and filtering - SP5

#### SP5-SREQ-1103 -> Originating routing information with the BGP shall be done with largest possible prefixes to minimize routing table size. More specific routing updates are only allowed for traffic engineering purposes under guidance of MNSMA as well as indication of certain service endpoints, like MN testing endpoint.

- TCA-CIAV-017378 -> REPO-00363-BGP routes aggretation and filtering - SP5

- TCA-CIAV-017382 -> REPO-02915-BGP TO BE MERGED Routing Protocol - SP5

#### SP5-SREQ-1104 -> Control method for valid service instance must be implemented in conjunction with originating of anycast routing entry for particular service.

- TCA-CIAV-017368 -> REPO-00083-Anycast routes advertised only if Service Functional - DNS Server - SP5

#### SP5-SREQ-188 -> Communications Services Providers must provide transparent routing infrastructure based on BGP routing protocol.



### SP5-TIN-163 -> Inter-domain Multicast Collaborator

#### SP5-SREQ-1203 -> All MN Participants shall only forward multicast traffic that has been requested by local user or from other MN participant(s) via PIM signalling.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017391 -> REPO-00128-[Multicast] Routing Functional - SP5

#### SP5-SREQ-189 -> Multicast service shall be based on any source multicast model.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017388 -> REPO-00392-Multicast Routing Protocol (PIM-SM) - SP5

- TCA-CIAV-017391 -> REPO-00128-[Multicast] Routing Functional - SP5



### SP5-TIN-242 -> NIP-RO Provider

#### SP5-SREQ-1200 -> NIP-ROb for the information domain services must be operated as GRE-tunnel over confidentiality protection with IPv4 protocol in GRE passenger, and either IPv6 or IPv4 in carrier.

- TCA-CIAV-017355 -> [Product Documentation] Compliance with profile PRF-130: IPv4 Generic Routing Encapsulation Profile

- TCA-CIAV-017386 -> REPO-00475-[NIP-CC][NIP-RO] NAMILCOM approved Crypto - SP5

- TCA-CIAV-017386 -> REPO-00475-[NIP-CC][NIP-ROb] GRE tunnel and NAMILCOM approved Crypto - SP5

#### SP5-SREQ-178 -> All Mission Network interconnections shall adhere to NIP profiles.

- TCA-CIAV-016742 -> REPO-00147 - NIP Connection Profiles - SP5

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-017390 -> REPO-00003-[QoS] Marking of Transit Packets - SP5

- TCA-CIAV-017394 -> REPO-02916-[QoS] Service Class Bandwith reservation - SP5

- TCA-CIAV-017395 -> REPO-02917-[Qos] Prioritization of latency sensitive services - SP5



### SP5-TIN-81 -> Inter-domain Multicast Source Discovery Collaborator

#### SP5-SREQ-1107 -> MSDP source active announcements shall be filtered based on mission network allowed multicast groups.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017374 -> REPO-00525-Multicast group filtering must be applied - SP5

#### SP5-SREQ-1108 -> Multicast Source Active signalling over the NIP interfaces shall be based on MSDP signalling.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017384 -> REPO-00570-Multicast Routing Inter-NIP - SP5

- TCA-CIAV-017391 -> REPO-00128-[Multicast] Routing Functional - SP5

#### SP5-SREQ-1109 -> MSDP sessions shall be authenticated using MD5 hash

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017384 -> REPO-00570-Multicast Routing Inter-NIP - SP5



### SP5-TIN-82 -> Provider to Provider Inter-domain Routing Collaborator

#### SP5-SREQ-1100 -> BGP sessions must be authenticated using MD5 hash

- TCA-CIAV-017376 -> REPO-00420-BGP Authentication - SP5

#### SP5-SREQ-1101 -> Route filtering of valid mission network prefixes shall be implemented in BGP.

- TCA-CIAV-014569 -> REPO-00047 TO BE MERGED WITH TCA-CIAV-017378 BGP Default Routes - SP5 

- TCA-CIAV-014569 -> REPO-00047-BGP Default Routes - SP5

- TCA-CIAV-017378 -> REPO-00363-BGP routes aggretation and filtering - SP5

- TCA-CIAV-017387 -> REPO-00457- Router inteconnection address space local scope - SP5

#### SP5-SREQ-1105 -> Bidirectional Forwarding Detection shall be used for BGP liveness detection.

- TCA-CIAV-017371 -> REPO-05681-BGP BFD (Bidirecciontal Forwarding Detection) - SP5

- TCA-CIAV-017453 -> BFD Performance

- TCA-CIAV-017453 -> [BGP] BFD Performance

#### SP5-SREQ-1106 -> Generalized TTL Security Mechanism shall be implement for BGP sessions

- TCA-CIAV-017372 -> REPO-05363- BGP GTSM (Generalyzed TTL Security Mechanism) configuration - SP5

#### SP5-SREQ-184 -> MN Communications Services Provider shall transit unicast traffic on behalf of all MN participants.



### SP5-TIN-83 -> Provider to Provider Inter-domain Multicast Signalling Collaborator

#### SP5-SREQ-1118 -> PIM multicast group signalling shall be filtered based on mission network allowed multicast groups.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017374 -> REPO-00525-Multicast group filtering must be applied - SP5

#### SP5-SREQ-185 -> Federated Communications Services Provider shall transit multicast traffic on behalf of all MN participants.

- TCA-CIAV-017357 -> [Product Documentation] Compliance with PRF-60 	• Inter-Autonomous Systems Multicast Signaling Profile

- TCA-CIAV-017391 -> REPO-00128-[Multicast] Routing Functional - SP5



### SP5-TIN-84 -> IPsec Transport Mode Protection Collaborator

#### SP5-SREQ-1110 -> NIP-G interface must be protected with IPSec ESP in Transport Mode.

- TCA-CIAV-017359 -> [Product Documentation] Compliance with PRF-73: Traffic Flow Confidentiality Protection Profile

- TCA-CIAV-017389 -> REPO-00107- [NIP-CC][Tactical Network] Commercial IPSec Encryption  - SP5



### SP5-TIN-85 -> Confidentiality Protection Collaborator

#### SP5-SREQ-1111 -> Information Domain classification above RESTRICTED, shall be confidentiality protected with cryptographic solution based on either NINE ISPEC or other NAMILCOM approved crypto.

- TCA-CIAV-017386 -> REPO-00475-[NIP-CC][NIP-RO] NAMILCOM approved Crypto - SP5

- TCA-CIAV-017386 -> REPO-00475-[NIP-CC][NIP-ROb] GRE tunnel and NAMILCOM approved Crypto - SP5

#### SP5-SREQ-1112 -> Information Domain classification below or maximum RESTRICTED, shall be confidentiality protected with cryptographic solution based on either NINE ISPEC or Commercial security solution.

- TCA-CIAV-017359 -> [Product Documentation] Compliance with PRF-73: Traffic Flow Confidentiality Protection Profile

- TCA-CIAV-017389 -> REPO-00107- [NIP-CC][Tactical Network] Commercial IPSec Encryption  - SP5



### SP5-TIN-89 -> IKEv2 Authentication Collaborator

#### SP5-SREQ-1113 -> NIP-G interface must be authenticated with IPSec IKEv2 exchange of x509v3 Digital Certificates.

- TCA-CIAV-017359 -> [Product Documentation] Compliance with PRF-73: Traffic Flow Confidentiality Protection Profile



### SP5-TIN-93 -> NIP-G Collaborator

#### SP5-SREQ-1114 -> NIP-G must be operated as GRE-tunnel over IPSec Transport mode service with IPv4 protocol both in carrier and GRE passenger

- TCA-CIAV-017355 -> [Product Documentation] Compliance with profile PRF-130: IPv4 Generic Routing Encapsulation Profile

#### SP5-SREQ-178 -> All Mission Network interconnections shall adhere to NIP profiles.

- TCA-CIAV-016742 -> REPO-00147 - NIP Connection Profiles - SP5

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-017356 -> [Product Documentation] Compliance with profile PRF-50: IP Quality of Service Profile

- TCA-CIAV-017390 -> REPO-00003-[QoS] Marking of Transit Packets - SP5

- TCA-CIAV-017394 -> REPO-02916-[QoS] Service Class Bandwith reservation - SP5

- TCA-CIAV-017395 -> REPO-02917-[Qos] Prioritization of latency sensitive services - SP5



### SP5-TIN-94 -> NIP-N Collaborator

#### SP5-SREQ-1117 -> NIP-N must be operated with IPv4 protocol

- TCA-CIAV-017379 -> REPO-00291-Internet Protocol Version - SP5

#### SP5-SREQ-178 -> All Mission Network interconnections shall adhere to NIP profiles.

- TCA-CIAV-016742 -> REPO-00147 - NIP Connection Profiles - SP5

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-016746 -> REPO-00454-[QoS] Handling of Unknown DSCP values - SP5

- TCA-CIAV-017356 -> [Product Documentation] Compliance with profile PRF-50: IP Quality of Service Profile

- TCA-CIAV-017390 -> REPO-00003-[QoS] Marking of Transit Packets - SP5

- TCA-CIAV-017394 -> REPO-02916-[QoS] Service Class Bandwith reservation - SP5

- TCA-CIAV-017395 -> REPO-02917-[Qos] Prioritization of latency sensitive services - SP5



### SP5-TIN-95 -> NIP-CC Collaborator

#### SP5-SREQ-1115 -> NIP-CC for the information domain services must be operated as GRE-tunnel over confidentiality protection with IPv4 protocol in GRE passenger, and either IPv4 in carrier.

- TCA-CIAV-017355 -> [Product Documentation] Compliance with profile PRF-130: IPv4 Generic Routing Encapsulation Profile

- TCA-CIAV-017386 -> REPO-00475-[NIP-CC][NIP-ROb] GRE tunnel and NAMILCOM approved Crypto - SP5

#### SP5-SREQ-1116 -> NIP-CC for the NMCD must be operated as GRE-tunnel over confidentiality protection with IPv4 protocol in GRE passenger, and IPv4 in carrier.

- TCA-CIAV-017386 -> REPO-00475-[NIP-CC][NIP-ROb] GRE tunnel and NAMILCOM approved Crypto - SP5

#### SP5-SREQ-178 -> All Mission Network interconnections shall adhere to NIP profiles.

- TCA-CIAV-016742 -> REPO-00147 - NIP Connection Profiles - SP5

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-017356 -> [Product Documentation] Compliance with profile PRF-50: IP Quality of Service Profile

- TCA-CIAV-017390 -> REPO-00003-[QoS] Marking of Transit Packets - SP5

- TCA-CIAV-017394 -> REPO-02916-[QoS] Service Class Bandwith reservation - SP5

- TCA-CIAV-017395 -> REPO-02917-[Qos] Prioritization of latency sensitive services - SP5



## SP5-SI-COMMSTPT -> Communications Transport

### SP5-TIN-102 -> Public Network Transport Service Collaborator

#### SP5-SREQ-1141 -> Bearer security function must be used when PCN interface uses public network public communications service as a bearer between PCN elements

- TCA-CIAV-017001 -> Public Service Transport PCN configuration

#### SP5-SREQ-1142 -> Bearer security function must separate PCN element and public network

- TCA-CIAV-017001 -> Public Service Transport PCN configuration

#### SP5-SREQ-1143 -> Bearer security function must filter traffic to contain only valid protocol (IKEv2, ESP, NAT-T and Echo-request/reply) between predefined endpoints (IP-addresses)

- TCA-CIAV-017001 -> Public Service Transport PCN configuration

#### SP5-SREQ-179 -> Mission Network Participants shall provide Network Access using bearers that allow the creation of a unified IP packet routing architecture throughout the Mission Network.

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5



### SP5-TIN-103 -> Military Network Transport Service Collaborator

#### SP5-SREQ-179 -> Mission Network Participants shall provide Network Access using bearers that allow the creation of a unified IP packet routing architecture throughout the Mission Network.

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5



### SP5-TIN-143 -> Information exchange over WB LOS Collaborator

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5

- TCA-CIAV-017080 -> NHDRWF Concurrent Voice and Data Exchange

- TCA-CIAV-017085 -> NHDRWF Multi-group calls

- TCA-CIAV-017088 -> NHDRWF PTT Selective Call, Static

- TCA-CIAV-017089 -> NHDRWF PTT Multicast Call, Static

- TCA-CIAV-017092 -> NHDRWF Radio Silence Effectiveness



### SP5-TIN-144 -> Information exchange over NB LOS Collaborator

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5

- TCA-CIAV-017039 -> NBWF Waveform Configuration

- TCA-CIAV-017041 -> NBWF Ed1 Synchronization Data verification

- TCA-CIAV-017042 -> NBWF Ed1 TDMA Multicast Voice service

- TCA-CIAV-017051 -> NBWF Verification of basic IP services

- TCA-CIAV-017052 -> NBWF Ed1 Air Interface Encryption verification

- TCA-CIAV-017060 -> NBWF Ed. 1 Radio Silence Verification

- TCA-CIAV-017070 -> SATURN Waveform Configuration

- TCA-CIAV-017076 -> SATURN PTT Voice service

- TCA-CIAV-017078 -> NHDRWF Waveform Configuration



### SP5-TIN-145 -> Information exchange over NB BLOS Collaborator

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5

- TCA-CIAV-017236 -> TACSAT IW Waveform Configuration

- TCA-CIAV-017240 -> TACSAT IW PTT Tactical Voice



### SP5-TIN-146 -> Information exchange over NHDRWF Collaborator

#### SP5-SREQ-179 -> Mission Network Participants shall provide Network Access using bearers that allow the creation of a unified IP packet routing architecture throughout the Mission Network.

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

- TCA-CIAV-017080 -> NHDRWF Concurrent Voice and Data Exchange

- TCA-CIAV-017085 -> NHDRWF Multi-group calls

- TCA-CIAV-017088 -> NHDRWF PTT Selective Call, Static

- TCA-CIAV-017089 -> NHDRWF PTT Multicast Call, Static

- TCA-CIAV-017092 -> NHDRWF Radio Silence Effectiveness

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5

- TCA-CIAV-017080 -> NHDRWF Concurrent Voice and Data Exchange

- TCA-CIAV-017085 -> NHDRWF Multi-group calls

- TCA-CIAV-017088 -> NHDRWF PTT Selective Call, Static

- TCA-CIAV-017089 -> NHDRWF PTT Multicast Call, Static

- TCA-CIAV-017092 -> NHDRWF Radio Silence Effectiveness



### SP5-TIN-147 -> Information exchange over NBWF Collaborator

#### SP5-SREQ-179 -> Mission Network Participants shall provide Network Access using bearers that allow the creation of a unified IP packet routing architecture throughout the Mission Network.

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

- TCA-CIAV-017039 -> NBWF Waveform Configuration

- TCA-CIAV-017041 -> NBWF Ed1 Synchronization Data verification

- TCA-CIAV-017042 -> NBWF Ed1 TDMA Multicast Voice service

- TCA-CIAV-017051 -> NBWF Verification of basic IP services

- TCA-CIAV-017052 -> NBWF Ed1 Air Interface Encryption verification

- TCA-CIAV-017060 -> NBWF Ed. 1 Radio Silence Verification

- TCA-CIAV-017078 -> NHDRWF Waveform Configuration

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5

- TCA-CIAV-017039 -> NBWF Waveform Configuration

- TCA-CIAV-017041 -> NBWF Ed1 Synchronization Data verification

- TCA-CIAV-017042 -> NBWF Ed1 TDMA Multicast Voice service

- TCA-CIAV-017051 -> NBWF Verification of basic IP services

- TCA-CIAV-017052 -> NBWF Ed1 Air Interface Encryption verification

- TCA-CIAV-017060 -> NBWF Ed. 1 Radio Silence Verification

- TCA-CIAV-017078 -> NHDRWF Waveform Configuration



### SP5-TIN-148 -> Information exchange over SATURN Collaborator

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5

- TCA-CIAV-017070 -> SATURN Waveform Configuration

- TCA-CIAV-017076 -> SATURN PTT Voice service



### SP5-TIN-149 -> Information exchange over TACSAT IW Collaborator

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5

- TCA-CIAV-017236 -> TACSAT IW Waveform Configuration

- TCA-CIAV-017240 -> TACSAT IW PTT Tactical Voice



### SP5-TIN-91 -> Direct Cable Interconnection Collaborator

#### SP5-SREQ-1139 -> Network interface bearer service shall support the use of direct cable connections between interconnected systems within a common secure shelter.

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

#### SP5-SREQ-179 -> Mission Network Participants shall provide Network Access using bearers that allow the creation of a unified IP packet routing architecture throughout the Mission Network.

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5



### SP5-TIN-92 -> Classified Local Area Network Collaborator

#### SP5-SREQ-1144 -> Interconnection over the Local Area Network must use traffic flow confidentiality protection

- TCA-CIAV-017036 -> Interconnection over the Classified Local Area Network

#### SP5-SREQ-1145 -> Network interface bearers and LAN extensions shall support the use of Local Area Network technology within areas that are physically secured to the highest level of information confidentiality

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

- TCA-CIAV-017036 -> Interconnection over the Classified Local Area Network

#### SP5-SREQ-179 -> Mission Network Participants shall provide Network Access using bearers that allow the creation of a unified IP packet routing architecture throughout the Mission Network.

- TCA-CIAV-016886 -> Communications Transport Standards Profiles  - SP5

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

- TCA-CIAV-016851 -> Information Exchange Security Requirements - TACCIS  - SP5



## SP5-SI-DDS -> Directory Data Synchronization

### SP5-TIN-62 -> Directory Replication Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-41 -> Access to the Directory Information Tree (DIT) shall be protected with name and password.

- TCA-CIAV-013010 -> [MetaTool] Credentials for Centralized Participants Branch

#### SP5-SREQ-42 -> Access to the centralized Directory (Centralized Directory Service Providers) shall only be permitted to the Directory Data Synchronization Services (Directory Synchronization Service Providers).

- TCA-CIAV-013011 -> [Central DIT] Restrict access to Directory

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-43 -> Credentials for authentication to the central DIT shall be randomly generated strings of high entropy - e.g. 22 literals from the set of upper-case characters, lower-case chararacters and numeric digits, chosen at random by a cryptograpically secure pseudorandom number generator (CSPRNG).

- TCA-CIAV-013010 -> [MetaTool] Credentials for Centralized Participants Branch

#### SP5-SREQ-46 -> The centralized Directory (Centralized Directory Service Provider) must log all events, registering (for a given update) at least: IP address of and credential name used by Directory Data Synchronization Services (Directory Synchronization Service Providers); dates and times; Distinguished Names (DNs) of records; and operation type (e.g. modify, add, delete).

- TCA-CIAV-013037 -> [Central DIT] Logging

- TCA-CIAV-013044 -> [MetaTool][Update] Objects in the Central DIT from own DIT

- TCA-CIAV-013054 -> [MetaTool][Initial-Push] From own DIT to Central DIT

- TCA-CIAV-013055 -> [MetaTool][Initial-Pull] From Central DIT to own DIT

#### SP5-SREQ-47 -> All connections between Directories and Directory Data Synchronization Services shall be protected by TLS with mutual authentication.

- TCA-CIAV-012961 -> [Central DIT] Implementation of StartTLS

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT



### SP5-TIN-62 -> Directory Replication Provider

#### SP5-SREQ-191 -> The the Directory Data Synchronization Services shall support data exchange mechanisms required in the Hub and Spoke topology i.e. push own MNP Directory data to and pull other participants directory data from the shared, Centralized Directory.

- TCA-CIAV-013041 -> [MetaTool][Filtering] Filter objects on Mandatory Attributes on Replication from own DIT to Central DIT

- TCA-CIAV-013044 -> [MetaTool][Update] Objects in the Central DIT from own DIT

- TCA-CIAV-013054 -> [MetaTool][Initial-Push] From own DIT to Central DIT

- TCA-CIAV-013055 -> [MetaTool][Initial-Pull] From Central DIT to own DIT

- TCA-CIAV-013056 -> [MetaTool][Filtering] Filter Out own Objects on Replication from Central DIT to own DIT

- TCA-CIAV-013057 -> [MetaTool][Update] Own DIT from updated Central DIT

#### SP5-SREQ-194 -> The Directory Data Synchronization Services shall replicate agreed set of common attributes.

- TCA-CIAV-012946 -> The SMA shall communicate the Mandatory and Optional Attributes

- TCA-CIAV-012947 -> The SMA shall communicate the Replication schedule

- TCA-CIAV-013041 -> [MetaTool][Filtering] Filter objects on Mandatory Attributes on Replication from own DIT to Central DIT

#### SP5-SREQ-195 -> The Directory Data Synchronization Services shall be able to filter the LDAP data that is available for replication.

- TCA-CIAV-013041 -> [MetaTool][Filtering] Filter objects on Mandatory Attributes on Replication from own DIT to Central DIT

- TCA-CIAV-013056 -> [MetaTool][Filtering] Filter Out own Objects on Replication from Central DIT to own DIT

#### SP5-SREQ-196 -> The Directory Data Synchronization Services, to avoid overuse of network and service resources, shall perform replication in accordance with agreed schedule.

- TCA-CIAV-012947 -> The SMA shall communicate the Replication schedule

- TCA-CIAV-013042 -> [MetaTool][Schedule] Replication Schedule Implementation

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-246 -> The Directory Data Synchronization Services shall be able to replicate, update and delete LDAP data within the designated subtree of the DIT in the centralized Directory.

- TCA-CIAV-012217 -> [MetaTool] Clean MN related configuration items for supported system

- TCA-CIAV-013010 -> [MetaTool] Credentials for Centralized Participants Branch

- TCA-CIAV-013019 -> [Central DIT] Clean MN related data and configuration items from system

- TCA-CIAV-013042 -> [MetaTool][Schedule] Replication Schedule Implementation

- TCA-CIAV-013044 -> [MetaTool][Update] Objects in the Central DIT from own DIT

- TCA-CIAV-013054 -> [MetaTool][Initial-Push] From own DIT to Central DIT

- TCA-CIAV-013055 -> [MetaTool][Initial-Pull] From Central DIT to own DIT

- TCA-CIAV-013057 -> [MetaTool][Update] Own DIT from updated Central DIT

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-45 -> MNP Directories shall log events relevant to any accounts which are shared with the federation, registering (for a given update) at least: IP address of and credential name used to access the Directory Services; dates and times; Distinguished Names (DNs) of records; and operation type (e.g. modify, add, delete).

#### SP5-SREQ-47 -> All connections between Directories and Directory Data Synchronization Services shall be protected by TLS with mutual authentication.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT



### SP5-TIN-63 -> Directory Replication Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

#### SP5-SREQ-41 -> Access to the Directory Information Tree (DIT) shall be protected with name and password.

#### SP5-SREQ-42 -> Access to the centralized Directory (Centralized Directory Service Providers) shall only be permitted to the Directory Data Synchronization Services (Directory Synchronization Service Providers).

- TCA-CIAV-013011 -> [Central DIT] Restrict access to Directory

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

#### SP5-SREQ-43 -> Credentials for authentication to the central DIT shall be randomly generated strings of high entropy - e.g. 22 literals from the set of upper-case characters, lower-case chararacters and numeric digits, chosen at random by a cryptograpically secure pseudorandom number generator (CSPRNG).

#### SP5-SREQ-46 -> The centralized Directory (Centralized Directory Service Provider) must log all events, registering (for a given update) at least: IP address of and credential name used by Directory Data Synchronization Services (Directory Synchronization Service Providers); dates and times; Distinguished Names (DNs) of records; and operation type (e.g. modify, add, delete).

- TCA-CIAV-013037 -> [Central DIT] Logging

#### SP5-SREQ-47 -> All connections between Directories and Directory Data Synchronization Services shall be protected by TLS with mutual authentication.

- TCA-CIAV-012961 -> [Central DIT] Implementation of StartTLS



### SP5-TIN-63 -> Mediated Directory Replication Mediator

#### SP5-SREQ-191 -> The the Directory Data Synchronization Services shall support data exchange mechanisms required in the Hub and Spoke topology i.e. push own MNP Directory data to and pull other participants directory data from the shared, Centralized Directory.

- TCA-CIAV-013058 -> [MetaTool-Provider][Initial-Push] from MNP Border DIT to Central DIT

- TCA-CIAV-013066 -> [MetaTool-Provider][Initial-Pull] From Central DIT to Border DIT

#### SP5-SREQ-193 -> The Synchronization Support Service Providers (with a Directory Data Synchronization Service in line with the schedule) shall be able to replicate, update, and delete Directory data within the centralized Directory (Centralized Directory Service Provider) on behalf of Directory Service Providers which are not capable to perform replication themselves.

- TCA-CIAV-012217 -> [MetaTool] Clean MN related configuration items for supported system

- TCA-CIAV-013058 -> [MetaTool-Provider][Initial-Push] from MNP Border DIT to Central DIT

- TCA-CIAV-013066 -> [MetaTool-Provider][Initial-Pull] From Central DIT to Border DIT

#### SP5-SREQ-194 -> The Directory Data Synchronization Services shall replicate agreed set of common attributes.

- TCA-CIAV-012946 -> The SMA shall communicate the Mandatory and Optional Attributes

- TCA-CIAV-012947 -> The SMA shall communicate the Replication schedule

- TCA-CIAV-013051 -> [MetaTool-Provider][Filtering] Filter Objects on Mandatory Attributes on Replication from MNP Border DIT to Central DIT

- TCA-CIAV-013058 -> [MetaTool-Provider][Initial-Push] from MNP Border DIT to Central DIT

#### SP5-SREQ-195 -> The Directory Data Synchronization Services shall be able to filter the LDAP data that is available for replication.

- TCA-CIAV-013051 -> [MetaTool-Provider][Filtering] Filter Objects on Mandatory Attributes on Replication from MNP Border DIT to Central DIT

- TCA-CIAV-013065 -> [MetaTool-Provider][Filtering] Filter Out own objects during Replication from Central DIT to MNP Border  DIT

#### SP5-SREQ-196 -> The Directory Data Synchronization Services, to avoid overuse of network and service resources, shall perform replication in accordance with agreed schedule.

- TCA-CIAV-012947 -> The SMA shall communicate the Replication schedule

- TCA-CIAV-013047 -> [MetaTool-Provider][Schedule] Replication Schedule Implementation

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-012994 -> [MetaTool-Provider] Check implementation of StartTLS to MNP Border DIT

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-246 -> The Directory Data Synchronization Services shall be able to replicate, update and delete LDAP data within the designated subtree of the DIT in the centralized Directory.

- TCA-CIAV-012217 -> [MetaTool] Clean MN related configuration items for supported system

- TCA-CIAV-013010 -> [MetaTool] Credentials for Centralized Participants Branch

- TCA-CIAV-013019 -> [Central DIT] Clean MN related data and configuration items from system

- TCA-CIAV-013058 -> [MetaTool-Provider][Initial-Push] from MNP Border DIT to Central DIT

- TCA-CIAV-013066 -> [MetaTool-Provider][Initial-Pull] From Central DIT to Border DIT

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-012994 -> [MetaTool-Provider] Check implementation of StartTLS to MNP Border DIT

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-443 -> The Synchronization Service Providers (with a Directory Data Synchronization Service in line with the schedule) shall be able to update Directory data within the centralized Directory (Centralized Directory Service Provider) on behalf of Directory Service Providers which are not capable to perform replication themselves.

- TCA-CIAV-012217 -> [MetaTool] Clean MN related configuration items for supported system

- TCA-CIAV-013036 -> [MetaTool-Provider][Update] MNP Border DIT from Updated Central READ DIT

- TCA-CIAV-013040 -> [MetaTool-Provider][Update] Central DIT from the MNP Border DIT

#### SP5-SREQ-444 -> The Directory Data Synchronization Service shall be able to delete Directory data within the centralized Directory on behalf of MNP Directories which are not capable to perform replication themselves.

- TCA-CIAV-013019 -> [Central DIT] Clean MN related data and configuration items from system

- TCA-CIAV-013036 -> [MetaTool-Provider][Update] MNP Border DIT from Updated Central READ DIT

- TCA-CIAV-013040 -> [MetaTool-Provider][Update] Central DIT from the MNP Border DIT

#### SP5-SREQ-47 -> All connections between Directories and Directory Data Synchronization Services shall be protected by TLS with mutual authentication.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT



### SP5-TIN-63 -> Directory Replication Provider

#### SP5-SREQ-191 -> The the Directory Data Synchronization Services shall support data exchange mechanisms required in the Hub and Spoke topology i.e. push own MNP Directory data to and pull other participants directory data from the shared, Centralized Directory.

- TCA-CIAV-013036 -> [MetaTool-Provider][Update] MNP Border DIT from Updated Central READ DIT

- TCA-CIAV-013040 -> [MetaTool-Provider][Update] Central DIT from the MNP Border DIT

#### SP5-SREQ-194 -> The Directory Data Synchronization Services shall replicate agreed set of common attributes.

- TCA-CIAV-012962 -> [Border DIT] Implementation of Attributes

- TCA-CIAV-013051 -> [MetaTool-Provider][Filtering] Filter Objects on Mandatory Attributes on Replication from MNP Border DIT to Central DIT

#### SP5-SREQ-195 -> The Directory Data Synchronization Services shall be able to filter the LDAP data that is available for replication.

- TCA-CIAV-013051 -> [MetaTool-Provider][Filtering] Filter Objects on Mandatory Attributes on Replication from MNP Border DIT to Central DIT

#### SP5-SREQ-196 -> The Directory Data Synchronization Services, to avoid overuse of network and service resources, shall perform replication in accordance with agreed schedule.

- TCA-CIAV-013047 -> [MetaTool-Provider][Schedule] Replication Schedule Implementation

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-246 -> The Directory Data Synchronization Services shall be able to replicate, update and delete LDAP data within the designated subtree of the DIT in the centralized Directory.

- TCA-CIAV-012986 -> [MetaTool-Provider] Credentials for Border Participants Branch

- TCA-CIAV-013010 -> [MetaTool] Credentials for Centralized Participants Branch

- TCA-CIAV-013019 -> [Central DIT] Clean MN related data and configuration items from system

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT

#### SP5-SREQ-45 -> MNP Directories shall log events relevant to any accounts which are shared with the federation, registering (for a given update) at least: IP address of and credential name used to access the Directory Services; dates and times; Distinguished Names (DNs) of records; and operation type (e.g. modify, add, delete).

- TCA-CIAV-013060 -> [Border DIT] Logging

#### SP5-SREQ-47 -> All connections between Directories and Directory Data Synchronization Services shall be protected by TLS with mutual authentication.

- TCA-CIAV-012994 -> [MetaTool-Provider] Check implementation of StartTLS to MNP Border DIT

- TCA-CIAV-012997 -> [MetaTool] Check implementation of StartTLS to Central DIT



## SP5-SI-DNS -> Domain Naming

### SP5-TIN-114 -> Anycast DNS Advertising Provider

#### SP5-SREQ-609 -> The Domain Name Service shall support anycast with a configurable address

- TCA-CIAV-014505 -> [Anycast] Root server has an unicast IP address

- TCA-CIAV-017368 -> REPO-00083-Anycast routes advertised only if Service Functional - DNS Server - SP5

#### SP5-SREQ-610 -> The Domain Name Service shall respond the anycast queries using the same anycast address that it is listening on.

- TCA-CIAV-017368 -> REPO-00083-Anycast routes advertised only if Service Functional - DNS Server - SP5

#### SP5-SREQ-611 -> The Domain Name Service shall use a configured unicast IP-address when queries are made to other servers.

- TCA-CIAV-014505 -> [Anycast] Root server has an unicast IP address



### SP5-TIN-26 -> DNS Query Consumer

#### SP5-SREQ-238 -> The Domain Name Service must support, at a minimum, the SOA-record, NS-record and A-record matching to the NS-records.

- TCA-CIAV-014472 -> DNS Resolution OCSP

- TCA-CIAV-014522 -> Forward Resolution

#### SP5-SREQ-611 -> The Domain Name Service shall use a configured unicast IP-address when queries are made to other servers.

- TCA-CIAV-014522 -> Forward Resolution

- TCA-CIAV-017439 -> DNS records check for WMTS server

- TCA-CIAV-017446 -> DNS records check for WMS server

- TCA-CIAV-017448 -> DNS records check for WFS server

#### SP5-SREQ-615 -> The Domain Name Service shall operate without using forwarders for zones hosted by other MNPs.

- TCA-CIAV-014507 -> No federated forwarders on Resolvers

- TCA-CIAV-014508 -> Separation of roles; Resolver



### SP5-TIN-26 -> DNS Query Provider

#### SP5-SREQ-1311 -> For name servers that have IP addresses listed as glue, the IP addresses must match the authoritative A records for that host.

- TCA-CIAV-011936 -> Verify IP addresses from partners JRE Processors can be resolved - DNS Check

- TCA-CIAV-014468 -> Consistency between authoritative nameservers

#### SP5-SREQ-1312 -> The set of NS records served by the authoritative name servers must match those proposed for the delegation in the parent zone.

- TCA-CIAV-014522 -> Forward Resolution

#### SP5-SREQ-1313 -> The data served by the authoritative name servers for the designated zone must be consistent.

- TCA-CIAV-014468 -> Consistency between authoritative nameservers

#### SP5-SREQ-1314 -> All authoritative name servers must serve the same NS record set for the designated domain.

- TCA-CIAV-014468 -> Consistency between authoritative nameservers

#### SP5-SREQ-1315 -> All authoritative name servers must serve the same SOA record for the designated domain.

- TCA-CIAV-014476 -> [ANS] Check Authoritative Answer for Zone

#### SP5-SREQ-1316 -> DNS response payload must not exceed 512 octets, where the delegation information in the referral is a complete set of NS records and one A record

- TCA-CIAV-014458 -> Check Root Name Server responds with no recursion enabled

#### SP5-SREQ-1317 -> For any zones that are not anycasted, responses from the authoritative name servers must contain the same source IP address as the destination IP address of the initial query.

- TCA-CIAV-014522 -> Forward Resolution

#### SP5-SREQ-1318 -> Trust anchors must be provided as complete DS records, including the key tag, the key algorithm, the digest hash type, and the digest hash.

- TCA-CIAV-014494 -> [DNSSEC] Trust Anchor DNS resolvers implemented

#### SP5-SREQ-1319 -> At the time of the listing request there must be a DNSKEY present in the child zone that matches each DS record.

- TCA-CIAV-014510 -> [DNSSEC] DNS Zone(s) Signed

#### SP5-SREQ-1320 -> Validation of the zone must be possible using the DS record set that has been provided for listing in the parent zone.

- TCA-CIAV-014455 -> [DNSSEC] Check zone delegations (DS records)

#### SP5-SREQ-234 -> The Domain Name Service shall support mission top level domains.

- TCA-CIAV-012976 -> [Namespace] Top Level Domain

#### SP5-SREQ-235 -> The Domain Name Service shall support country code top level domains.

- TCA-CIAV-012976 -> [Namespace] Top Level Domain

#### SP5-SREQ-238 -> The Domain Name Service must support, at a minimum, the SOA-record, NS-record and A-record matching to the NS-records.

- TCA-CIAV-014522 -> Forward Resolution

- TCA-CIAV-016894 -> Check the SOA record of each domain on ANS

#### SP5-SREQ-239 -> The Domain Name Service must support the reverse zone containing the matching PTR-records.

- TCA-CIAV-014468 -> Consistency between authoritative nameservers

- TCA-CIAV-014509 -> Reverse lookup zone exists

#### SP5-SREQ-378 -> A distinct zone file shall be created for each signed zone.

- TCA-CIAV-014510 -> [DNSSEC] DNS Zone(s) Signed

#### SP5-SREQ-379 -> The Authoritative Name Services shall be able to delegate unsigned zones.

#### SP5-SREQ-380 -> The Domain Name Service shall be able to delegate the signing of subdomains.

- TCA-CIAV-014455 -> [DNSSEC] Check zone delegations (DS records)

- TCA-CIAV-014522 -> Forward Resolution

#### SP5-SREQ-382 -> The Domain Name Service shall be able to serve signed zones.

- TCA-CIAV-014455 -> [DNSSEC] Check zone delegations (DS records)

#### SP5-SREQ-613 -> The Authoritative Name Services shall support the provision of two independent name servers for each delegated zone.

- TCA-CIAV-014468 -> Consistency between authoritative nameservers

- TCA-CIAV-014502 -> Check for at least two NS records for each zone.

#### SP5-SREQ-614 -> The Authoritative Name Services shall allow delegation of reverse lookup zones of IPv4 prefixes that align on full 8 bits.

- TCA-CIAV-014520 -> Reverse Resolution

#### SP5-SREQ-616 -> The Authoritative Name Services shall not support Recursive DNS Queries.

- TCA-CIAV-014450 -> [ANS] Check Authoritative Name Server responds with no recursion enabled

- TCA-CIAV-014458 -> Check Root Name Server responds with no recursion enabled

- TCA-CIAV-014483 -> Separation of roles; Authoritative Name Server



### SP5-TIN-370 -> DNS Root Provider

#### SP5-SREQ-1272 -> The root zone shall be signed with one of the following algorithms: RSASHA256, RSASHA512, ECDSAP256SHA256, and ECDSAP384SHA384

- TCA-CIAV-016840 -> The root zone shall be signed with one of the required algorithms.

#### SP5-SREQ-234 -> The Domain Name Service shall support mission top level domains.

- TCA-CIAV-012976 -> [Namespace] Top Level Domain

#### SP5-SREQ-235 -> The Domain Name Service shall support country code top level domains.

- TCA-CIAV-012976 -> [Namespace] Top Level Domain

#### SP5-SREQ-242 -> The Authoritative Name Services must support the ability to provide the root zone.

- TCA-CIAV-014485 -> Check the SOA record of Root Zone

#### SP5-SREQ-525 -> The root zone shall be signed.

- TCA-CIAV-016840 -> The root zone shall be signed with one of the required algorithms.

#### SP5-SREQ-617 -> The Authoritative Name Services shall support the serving of the root zone by each MNP to its own resolvers

- TCA-CIAV-014458 -> Check Root Name Server responds with no recursion enabled



### SP5-TIN-43 -> DNS Root Zone Transfer Consumer

#### SP5-SREQ-241 -> The Domain Name Service must support zone updates via zone transfers.

- TCA-CIAV-014457 -> [Root] Zone Transfer - Primary Root zone transfers to the secondary server

#### SP5-SREQ-529 -> Authoritative Name Services shall secure DNS Zone Transfers with Secret Key Transaction Authentication for DNS (TSIG).

- TCA-CIAV-014457 -> [Root] Zone Transfer - Primary Root zone transfers to the secondary server

- TCA-CIAV-017476 -> Slave Root - Secure Root Zone Transfer (TSIG)

#### SP5-SREQ-611 -> The Domain Name Service shall use a configured unicast IP-address when queries are made to other servers.

- TCA-CIAV-014457 -> [Root] Zone Transfer - Primary Root zone transfers to the secondary server



### SP5-TIN-43 -> DNS Root Zone Transfer Provider

#### SP5-SREQ-241 -> The Domain Name Service must support zone updates via zone transfers.

- TCA-CIAV-014457 -> [Root] Zone Transfer - Primary Root zone transfers to the secondary server

#### SP5-SREQ-529 -> Authoritative Name Services shall secure DNS Zone Transfers with Secret Key Transaction Authentication for DNS (TSIG).

- TCA-CIAV-014457 -> [Root] Zone Transfer - Primary Root zone transfers to the secondary server

- TCA-CIAV-014540 -> Primary Root - Secure Root Zone Transfer (TSIG)

#### SP5-SREQ-611 -> The Domain Name Service shall use a configured unicast IP-address when queries are made to other servers.

- TCA-CIAV-014457 -> [Root] Zone Transfer - Primary Root zone transfers to the secondary server

#### SP5-SREQ-612 -> The Authoritative Name Services shall support being hidden (not accessible for normal DNS queries) when operating as a root server.

- TCA-CIAV-014495 -> [Root] Master Root server is hidden



## SP5-SI-EMAIL -> Informal Messaging

### SP5-TIN-11 -> Email routing Collaborator

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

#### SP5-SREQ-243 -> The naming scheme and conventions for the informal messaging domain space shall be independent from the naming scheme and domain space used for hostnames, (windows) domain names, or user accounts

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

#### SP5-SREQ-244 -> Each mission network shall allow the maximum size including attachments to be configured at instantiation for both send and receiving of informal messages.

- TCA-CIAV-012999 -> Block e-mails larger than the size specified in the JMEI - Sender MTA - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

- TCA-CIAV-017513 -> Digital GI Designation letter - Email (Alternative)

#### SP5-SREQ-247 -> The informal messaging service shall be able to transfer attachments in all the file formats included in the corresponding profile for: still image coding, word processing documents, spreadsheets and presentations as well as document exchange, storage and long-term preservation.

- TCA-CIAV-013005 -> Send Email - Attachments - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

- TCA-CIAV-017315 -> [Product Documentation] Compliance with PRF-39 "File Format Profile"

- TCA-CIAV-017513 -> Digital GI Designation letter - Email (Alternative)

- TCA-CIAV-017521 -> Update Mission GI GAP and send it via email (Alternative)

#### SP5-SREQ-29 -> The user shall be made aware of the message classification with accordance with the label.

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

- TCA-CIAV-017316 -> [Product Documentation] Compliance with PRF-8 "Metadata Labelling Profile" 

#### SP5-SREQ-33 -> Email servers shall use certificates compliant with VPN or TLS Server Certificate Profile defined in iTIF.

- TCA-CIAV-013007 -> MTA X.509 certificate signed by trusted CA - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

- TCA-CIAV-017322 -> [PKI Procedural Instruction] Digital Certificates meet ITIF criteria

#### SP5-SREQ-34 -> Connections between email servers shall be protected by TLS with mutual authentication.

- TCA-CIAV-013006 -> Use of SMTP-TLS - SP5

- TCA-CIAV-013689 -> SMTP Mutual TLS Auth - negative X.509 certicate validation - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

- TCA-CIAV-017314 -> [Product Documentation] Check compliance with PRF-164 Transport Layer Security Fallback Profile 

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-013689 -> SMTP Mutual TLS Auth - negative X.509 certicate validation - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

#### SP5-SREQ-432 -> The Informal Messaging Services shall be able to generate message disposition notifications (MDN).

- TCA-CIAV-013003 -> Message Disposition Notification (MDN) and Delivery Status Notification (DSN) - MUA - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

#### SP5-SREQ-433 -> The Informal Messaging Services shall be able to generate delivery status notifications (DSN).

- TCA-CIAV-013003 -> Message Disposition Notification (MDN) and Delivery Status Notification (DSN) - MUA - SP5

- TCA-CIAV-013022 -> Message Tracking and Delivery Notification - MTA Configuration - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

#### SP5-SREQ-55 -> All email messages, and all documents attached to these emails, shall be labelled with classification and releasability compliant with the Confidentiality Metadata Label Syntax in ADatP-4774.

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017234 -> Written Directives Operational Orders (OPORD/WARNORD) Dissemination PDF Document - Email

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017256 -> Written Directives Fragmentary Order (FRAGO) Dissemination PDF Document - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

- TCA-CIAV-017316 -> [Product Documentation] Compliance with PRF-8 "Metadata Labelling Profile" 

- TCA-CIAV-017317 -> [Confidentility Labeling] SPIF File available

#### SP5-SREQ-56 -> All email messages and system traffic between mail servers shall be logged.

- TCA-CIAV-013000 -> Logging of Transmissions - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)

#### SP5-SREQ-57 -> Event logs must include, when possible and available: date and time; IP address and name of the server or client; IP address of the destination server; message ID; SMTP Sender and Recipient address(es); email headers; size; and subject.

- TCA-CIAV-013000 -> Logging of Transmissions - SP5

- TCA-CIAV-017019 -> Electronic Target Folder (ETF) - Email (IER-72)

- TCA-CIAV-017048 -> National Guidance and Caveats - Email - (IER-53)

- TCA-CIAV-017231 -> Collection Request for Targeting - Email (IER-596) 

- TCA-CIAV-017235 -> Target Nomination List (TNL) - Email (IER-65)

- TCA-CIAV-017251 -> Target List (IER-60) - Email

- TCA-CIAV-017252 -> Joint Prioritised Target List (IER-61) - Email

- TCA-CIAV-017262 -> Joint Prioritised Target List (IER-75) - Email

- TCA-CIAV-017264 -> Joint Prioritised Target List (IER-279) - Email

- TCA-CIAV-017271 -> JISR Product for Target System Analysis - Email (IER-56)

- TCA-CIAV-017273 -> Request for Information Responses - Email (IER-76)

- TCA-CIAV-017284 -> Mission Report - Email (IER-81)

- TCA-CIAV-017285 -> Targeting Annex - Email (IER-64)

- TCA-CIAV-017292 -> Fragmentary Order - Email (IER-287)

- TCA-CIAV-017294 -> Entity Criticality - Email (IER-478)

- TCA-CIAV-017296 -> Candidate Target List - Email (IER-59)



## SP5-SI-FFT -> Friendly Force Tracking

### SP5-TIN-75 -> FFT Gateway Consumer

#### SP5-SREQ-101 -> FFT systems must log all events, registering at least: IP address and port number of all communications between FFT gateways; and user acmes and other resource attempts.

- TCA-CIAV-013052 -> Logging is avaiable in FFT system

#### SP5-SREQ-103 -> The FFT Gateways, Hubs and Proxies shall be provided as a highly available solution, e.g. load balanced/hot standby.

#### SP5-SREQ-104 -> Recommended to limit connections from and to FFT Systems only to known recognized, good IP addresses shall be considered.

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-012951 -> Verify IP connectivity with Partners MNPs

#### SP5-SREQ-106 -> Communication between servers shall be secured via Transport Layer Security (TLS) with mutual authentication.

- TCA-CIAV-013048 -> Verify using TLS over IP1

- TCA-CIAV-013050 -> Verify using TLS over WSMP

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

#### SP5-SREQ-118 -> The system shall support symbol standard required from the adopted version of the ADatP-36 standard.

#### SP5-SREQ-1187 -> A system supporting ADatP-36(B) shall support the use of the FFTSC (FRIENDLY FORCE TRACKING SERVICES CONFIGURATION) message to configure its system automatically.

#### SP5-SREQ-1188 -> A system supporting ADatP-36(B) shall be capable of supplying its System Capability information as a FFTSPC (FRIENDLY FORCE TRACKING SERVICE PROVIDER CAPABILITIES) message

#### SP5-SREQ-1189 -> Communication between servers is secured via Transport Layer Security (TLS). Involved systems shall be able to exchange (directly or via a shared PKI infrastructure) their X.509 public certificate with the data exchange partner system.

- TCA-CIAV-013048 -> Verify using TLS over IP1

#### SP5-SREQ-119 -> The system shall support ADatP-36 Message Formats.

- TCA-CIAV-012932 -> Configuration of TTL parameters

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-161 -> The FFT Service Management Authority shall verify that end-to-end connectivity among all elements can be effectively established. This will be done the first time a FFT network is built as well every time elements are added, modified or removed. The minimum requirement is that blue dots can be correctly exchanged among all FFT systems.

- TCA-CIAV-012951 -> Verify IP connectivity with Partners MNPs

- TCA-CIAV-012957 -> Gateway exiting the Federated FFT network

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-526 -> The system shall consume valid (well formed) FFT tracks.

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

- TCA-CIAV-017040 -> Land Friendly Force Track (FFT) - FFI MTF

#### SP5-SREQ-533 -> The system shall control the assignment and distribution of unique terminal identifications (IDs) across a network.

#### SP5-SREQ-534 -> The system shall define periods for track aging which will be applied by all systems.



### SP5-TIN-75 -> FFT Gateway Provider

#### SP5-SREQ-101 -> FFT systems must log all events, registering at least: IP address and port number of all communications between FFT gateways; and user acmes and other resource attempts.

- TCA-CIAV-013052 -> Logging is avaiable in FFT system

#### SP5-SREQ-103 -> The FFT Gateways, Hubs and Proxies shall be provided as a highly available solution, e.g. load balanced/hot standby.

#### SP5-SREQ-104 -> Recommended to limit connections from and to FFT Systems only to known recognized, good IP addresses shall be considered.

- TCA-CIAV-012951 -> Verify IP connectivity with Partners MNPs

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

#### SP5-SREQ-106 -> Communication between servers shall be secured via Transport Layer Security (TLS) with mutual authentication.

- TCA-CIAV-013048 -> Verify using TLS over IP1

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

#### SP5-SREQ-118 -> The system shall support symbol standard required from the adopted version of the ADatP-36 standard.

#### SP5-SREQ-1187 -> A system supporting ADatP-36(B) shall support the use of the FFTSC (FRIENDLY FORCE TRACKING SERVICES CONFIGURATION) message to configure its system automatically.

#### SP5-SREQ-1188 -> A system supporting ADatP-36(B) shall be capable of supplying its System Capability information as a FFTSPC (FRIENDLY FORCE TRACKING SERVICE PROVIDER CAPABILITIES) message

- TCA-CIAV-017288 -> FFTSPC and FFTSC configuration exchange

#### SP5-SREQ-1189 -> Communication between servers is secured via Transport Layer Security (TLS). Involved systems shall be able to exchange (directly or via a shared PKI infrastructure) their X.509 public certificate with the data exchange partner system.

- TCA-CIAV-013048 -> Verify using TLS over IP1

#### SP5-SREQ-119 -> The system shall support ADatP-36 Message Formats.

- TCA-CIAV-012932 -> Configuration of TTL parameters

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-012944 -> Configuration of unique codes and system identifiers

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-158 -> The system shall support the IP1 protocol and conditionally IP2 and WSMP (version 1.3.2) protocols as described in ADatP-36(A)(2) or the IP1 protocol and conditionally IP2 as described in ADatP-36(B).

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-012945 -> Verify local connectivity dependencies

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-161 -> The FFT Service Management Authority shall verify that end-to-end connectivity among all elements can be effectively established. This will be done the first time a FFT network is built as well every time elements are added, modified or removed. The minimum requirement is that blue dots can be correctly exchanged among all FFT systems.

- TCA-CIAV-012951 -> Verify IP connectivity with Partners MNPs

- TCA-CIAV-012957 -> Gateway exiting the Federated FFT network

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-162 -> FFT Gateways shall only inject tracks into the FFT network that are compliant with the mission network security policy.

- TCA-CIAV-012943 -> Configuration of Security Marks

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

#### SP5-SREQ-249 -> The system shall provide valid (well formed) FFT tracks.

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-013053 -> Verification that designated FFT Server is contributing FFT SA to the COP system

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

#### SP5-SREQ-533 -> The system shall control the assignment and distribution of unique terminal identifications (IDs) across a network.

#### SP5-SREQ-534 -> The system shall define periods for track aging which will be applied by all systems.

#### SP5-SREQ-93 -> All ADatP-36 messages shall be labelled with the classification and the releasability.

- TCA-CIAV-012943 -> Configuration of Security Marks

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks



### SP5-TIN-78 -> FFT Gateway Consumer

#### SP5-SREQ-101 -> FFT systems must log all events, registering at least: IP address and port number of all communications between FFT gateways; and user acmes and other resource attempts.

#### SP5-SREQ-103 -> The FFT Gateways, Hubs and Proxies shall be provided as a highly available solution, e.g. load balanced/hot standby.

#### SP5-SREQ-104 -> Recommended to limit connections from and to FFT Systems only to known recognized, good IP addresses shall be considered.

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp

#### SP5-SREQ-106 -> Communication between servers shall be secured via Transport Layer Security (TLS) with mutual authentication.

- TCA-CIAV-013048 -> Verify using TLS over IP1

- TCA-CIAV-013050 -> Verify using TLS over WSMP

#### SP5-SREQ-118 -> The system shall support symbol standard required from the adopted version of the ADatP-36 standard.

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp

#### SP5-SREQ-1187 -> A system supporting ADatP-36(B) shall support the use of the FFTSC (FRIENDLY FORCE TRACKING SERVICES CONFIGURATION) message to configure its system automatically.

- TCA-CIAV-017288 -> FFTSPC and FFTSC configuration exchange

#### SP5-SREQ-1188 -> A system supporting ADatP-36(B) shall be capable of supplying its System Capability information as a FFTSPC (FRIENDLY FORCE TRACKING SERVICE PROVIDER CAPABILITIES) message

- TCA-CIAV-013050 -> Verify using TLS over WSMP

#### SP5-SREQ-1189 -> Communication between servers is secured via Transport Layer Security (TLS). Involved systems shall be able to exchange (directly or via a shared PKI infrastructure) their X.509 public certificate with the data exchange partner system.

- TCA-CIAV-013048 -> Verify using TLS over IP1

#### SP5-SREQ-119 -> The system shall support ADatP-36 Message Formats.

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-013027 -> Hub Filtering of Tracks Based on System Name

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp

#### SP5-SREQ-161 -> The FFT Service Management Authority shall verify that end-to-end connectivity among all elements can be effectively established. This will be done the first time a FFT network is built as well every time elements are added, modified or removed. The minimum requirement is that blue dots can be correctly exchanged among all FFT systems.

- TCA-CIAV-012956 -> Hub Exiting the Federated FFT Network

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-526 -> The system shall consume valid (well formed) FFT tracks.

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-533 -> The system shall control the assignment and distribution of unique terminal identifications (IDs) across a network.

#### SP5-SREQ-534 -> The system shall define periods for track aging which will be applied by all systems.



### SP5-TIN-78 -> FFT Hub Mediator

#### SP5-SREQ-101 -> FFT systems must log all events, registering at least: IP address and port number of all communications between FFT gateways; and user acmes and other resource attempts.

#### SP5-SREQ-103 -> The FFT Gateways, Hubs and Proxies shall be provided as a highly available solution, e.g. load balanced/hot standby.

- TCA-CIAV-013027 -> Hub Filtering of Tracks Based on System Name

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp

#### SP5-SREQ-118 -> The system shall support symbol standard required from the adopted version of the ADatP-36 standard.

#### SP5-SREQ-1187 -> A system supporting ADatP-36(B) shall support the use of the FFTSC (FRIENDLY FORCE TRACKING SERVICES CONFIGURATION) message to configure its system automatically.

- TCA-CIAV-017288 -> FFTSPC and FFTSC configuration exchange

#### SP5-SREQ-1188 -> A system supporting ADatP-36(B) shall be capable of supplying its System Capability information as a FFTSPC (FRIENDLY FORCE TRACKING SERVICE PROVIDER CAPABILITIES) message

- TCA-CIAV-017288 -> FFTSPC and FFTSC configuration exchange

#### SP5-SREQ-1189 -> Communication between servers is secured via Transport Layer Security (TLS). Involved systems shall be able to exchange (directly or via a shared PKI infrastructure) their X.509 public certificate with the data exchange partner system.

- TCA-CIAV-013048 -> Verify using TLS over IP1

- TCA-CIAV-013050 -> Verify using TLS over WSMP

#### SP5-SREQ-119 -> The system shall support ADatP-36 Message Formats.

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-013027 -> Hub Filtering of Tracks Based on System Name

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp

#### SP5-SREQ-1190 -> In a FFT network where all systems do not support the same version of the ADatP-36 Message Format, a FFT Proxy system shall be available to transform from one version to another.

- TCA-CIAV-017298 -> FFT ADatP-36A(2) to ADatP-36B proxy

- TCA-CIAV-017301 -> FFT ADatP-36B to ADatP-36A(2) proxy

#### SP5-SREQ-161 -> The FFT Service Management Authority shall verify that end-to-end connectivity among all elements can be effectively established. This will be done the first time a FFT network is built as well every time elements are added, modified or removed. The minimum requirement is that blue dots can be correctly exchanged among all FFT systems.

- TCA-CIAV-012956 -> Hub Exiting the Federated FFT Network

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-249 -> The system shall provide valid (well formed) FFT tracks.

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP



### SP5-TIN-78 -> FFT Gateway Provider

#### SP5-SREQ-101 -> FFT systems must log all events, registering at least: IP address and port number of all communications between FFT gateways; and user acmes and other resource attempts.

#### SP5-SREQ-103 -> The FFT Gateways, Hubs and Proxies shall be provided as a highly available solution, e.g. load balanced/hot standby.

#### SP5-SREQ-104 -> Recommended to limit connections from and to FFT Systems only to known recognized, good IP addresses shall be considered.

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

#### SP5-SREQ-106 -> Communication between servers shall be secured via Transport Layer Security (TLS) with mutual authentication.

- TCA-CIAV-013048 -> Verify using TLS over IP1

- TCA-CIAV-013050 -> Verify using TLS over WSMP

#### SP5-SREQ-118 -> The system shall support symbol standard required from the adopted version of the ADatP-36 standard.

#### SP5-SREQ-1187 -> A system supporting ADatP-36(B) shall support the use of the FFTSC (FRIENDLY FORCE TRACKING SERVICES CONFIGURATION) message to configure its system automatically.

#### SP5-SREQ-1188 -> A system supporting ADatP-36(B) shall be capable of supplying its System Capability information as a FFTSPC (FRIENDLY FORCE TRACKING SERVICE PROVIDER CAPABILITIES) message

#### SP5-SREQ-1189 -> Communication between servers is secured via Transport Layer Security (TLS). Involved systems shall be able to exchange (directly or via a shared PKI infrastructure) their X.509 public certificate with the data exchange partner system.

- TCA-CIAV-013048 -> Verify using TLS over IP1

- TCA-CIAV-013050 -> Verify using TLS over WSMP

#### SP5-SREQ-119 -> The system shall support ADatP-36 Message Formats.

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-012944 -> Configuration of unique codes and system identifiers

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-013027 -> Hub Filtering of Tracks Based on System Name

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp

#### SP5-SREQ-158 -> The system shall support the IP1 protocol and conditionally IP2 and WSMP (version 1.3.2) protocols as described in ADatP-36(A)(2) or the IP1 protocol and conditionally IP2 as described in ADatP-36(B).

- TCA-CIAV-012942 -> Configuration of connections / roles

- TCA-CIAV-012945 -> Verify local connectivity dependencies

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

#### SP5-SREQ-161 -> The FFT Service Management Authority shall verify that end-to-end connectivity among all elements can be effectively established. This will be done the first time a FFT network is built as well every time elements are added, modified or removed. The minimum requirement is that blue dots can be correctly exchanged among all FFT systems.

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-162 -> FFT Gateways shall only inject tracks into the FFT network that are compliant with the mission network security policy.

- TCA-CIAV-012943 -> Configuration of Security Marks

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

#### SP5-SREQ-249 -> The system shall provide valid (well formed) FFT tracks.

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013025 -> Verify Exchange of Blue Dots WSMP

- TCA-CIAV-013027 -> Hub Filtering of Tracks Based on System Name

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp

#### SP5-SREQ-533 -> The system shall control the assignment and distribution of unique terminal identifications (IDs) across a network.

#### SP5-SREQ-534 -> The system shall define periods for track aging which will be applied by all systems.

#### SP5-SREQ-93 -> All ADatP-36 messages shall be labelled with the classification and the releasability.

- TCA-CIAV-012943 -> Configuration of Security Marks

- TCA-CIAV-013023 -> Verify Exchange of Blue Dots IP1

- TCA-CIAV-013024 -> Verify Exchange of Blue Dots IP2

- TCA-CIAV-013030 -> Hub Verification of the Exchange of Tracks

- TCA-CIAV-013038 -> Verify the IP1/IP2 Header with the Source System Information and a New Timestamp



### SP5-TIN-79 -> FFT Augmentation Collaborator

#### SP5-SREQ-111 -> An FFT System shall provide an augmentation/sanitization Table to the TrAD Authority.

- TCA-CIAV-012950 -> Provide Track Augmentation Data Table

- TCA-CIAV-017297 -> FFT Track Augmentation Exchange - email

#### SP5-SREQ-116 -> FFT Hubs, FFT Proxies and FFT Gateways shall perform track augmentation/sanitization using table when receiving only blue dots.

- TCA-CIAV-013046 -> Augment Tracks

#### SP5-SREQ-248 -> FFT Gateways, Hubs and Proxies shall merge and maintain an augmentation/sanitization table.

- TCA-CIAV-012950 -> Provide Track Augmentation Data Table

- TCA-CIAV-013045 -> Provide Merged Augmentation Table



## SP5-SI-G2A -> Ground-to-Air Information Exchange

### SP5-TIN-172 -> Consume Link-16 messages Consumer

#### SP5-SREQ-152 -> The Ground-to-Air Service shall be connected to the Link 16 network via Joint Range Extension (JRE) using JRE Applications Protocol (JREAP) connection to receive and transmit Link 16 (J-series) messages.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016558 -> Ground-to-Air Service connected to Link 16 network via Joint Range Extension (JRE) Application Protocol (JREAP) - C connection and able to receive Link 16 J2.x Precise Participant Location and Information (PPLI) mess

- TCA-CIAV-016586 -> Set and verify configuration of Ground-to-Air System

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-153 -> The Ground-to-Air Service shall monitor the Link 16 network for appropriate J12.6 Target Sorting messages to identify triggers for the service.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016558 -> Ground-to-Air Service connected to Link 16 network via Joint Range Extension (JRE) Application Protocol (JREAP) - C connection and able to receive Link 16 J2.x Precise Participant Location and Information (PPLI) mess

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-438 -> Events shall be logged on all G2A SA Systems.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-441 -> The service shall limit connections from and to G2A SA systems only to known recognized good IP addresses.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016586 -> Set and verify configuration of Ground-to-Air System

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-442 -> Friendly PLI is assumed to be at a lower or the same security level as the communication network used to forward the PLI to the G2A SA service and shall be releasable to the tactical data link domain of the weapon delivery assets.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-537 -> The Ground-to-Air Service shall filter the incoming J12.6 Target according to JU, geographic area, environment, pointer bit and status information discrete (SID).

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-539 -> The Ground-to-Air Service shall ignore retransmitted J12.6 messages with the same index number within J12.6 lockout period.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-540 -> The Ground-to-Air Service shall incorporate a J12.6 lockout period (0 to 511 seconds) either globally and by JU/JUs.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016586 -> Set and verify configuration of Ground-to-Air System

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-541 -> The Ground-to-Air Service shall only respond to J12.6 Target Sorting messages that are received from inside of Reporting Area.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-543 -> All timestamps shall be based on the Coordinated Universal Time (UTC).

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-544 -> The Ground-to-Air Service shall be assigned  its own JU number.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016586 -> Set and verify configuration of Ground-to-Air System

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-577 -> The Ground-to-Air Services that are assigned the same reporting area or overlapping reporting areas shall only respond to J12.6  Target Sorting messages at specific reporting times.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016586 -> Set and verify configuration of Ground-to-Air System

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-578 -> The Ground-to-Air Service shall respond to each J12.6 Target Sorting message within 5 seconds of receipt.

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)



### SP5-TIN-173 -> Provide Link-16 messages Provider

#### SP5-SREQ-152 -> The Ground-to-Air Service shall be connected to the Link 16 network via Joint Range Extension (JRE) using JRE Applications Protocol (JREAP) connection to receive and transmit Link 16 (J-series) messages.

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-154 -> The Ground-to-Air Service shall transmit J2.0 Indirect Interface PPLI message to remain active on the Link 16 network.

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-156 -> When triggered by an appropriate J12.6 message, the Ground-to-Air Service shall identify friendly/neutral ground tracks in the vicinity of the point of interest.

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-016555 -> Ground-to-Air Service identify friendly or neutral tracks in the vicinity of J12.6 position of interest

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-159 -> The Ground-to-Air Service shall generate and transmit J3.5 Land Track messages for closest friendly/neutral ground tracks from most recent stored data.

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-172 -> The Ground-to-Air Service shall generate and transmit J3.2 Air Track messages for closest air tracks from the most recent stored data.

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-173 -> The Ground-to-Air Service shall transmit a J7.0 Drop Track message to drop transmitted J3.5 Land Track and J3.2 Air Track messages after a pre-set time.

- TCA-CIAV-016552 -> Ground-to-Air Service generate and transmit J7.0 Drop Track messages for reported J3.2/J3.5 messages

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-192 -> The Ground-to-Air Service shall be able to report the number of transmitted Land Track messages via a J28.2(0) Text message.

- TCA-CIAV-016551 -> Ground-to-Air Service generate and transmit J28.2(0) Text message to report number of reported tracks

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-442 -> Friendly PLI is assumed to be at a lower or the same security level as the communication network used to forward the PLI to the G2A SA service and shall be releasable to the tactical data link domain of the weapon delivery assets.

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-544 -> The Ground-to-Air Service shall be assigned  its own JU number.

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-545 -> The Ground-to-Air Service shall incorporate a capability to transmit a J28.2(0) No PLI Response text message to notify that no friendly or neutral positions were found in the area.

- TCA-CIAV-016551 -> Ground-to-Air Service generate and transmit J28.2(0) Text message to report number of reported tracks

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-547 -> The Ground-to-Air Service shall be capable of manual input of its location for inclusion in the transmitted J2.x message self-report.

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-549 -> The Ground-to-Air Service shall perform C2 functions as a C2 IU with reporting responsibilities in reporting friendly and neutral positional information.

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-551 -> The Ground-to-Air Service shall be assigned a geographic reporting area for which it is responsible to respond.

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-552 -> The Ground-to-Air Service shall search its database for friendly and neutral positions around point of interest (POI).

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-016555 -> Ground-to-Air Service identify friendly or neutral tracks in the vicinity of J12.6 position of interest

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-553 -> The Ground-to-Air Service shall map FFI MTF data elements to Link 16  J3.2 Air Track message fields correctly according to ADatP-37.

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-554 -> The Ground-to-Air Service shall map FFI MTF data elements to Link 16  J3.5 Land Track message fields correctly according to ADatP-37.

- TCA-CIAV-016554 -> Generate and transmit J3.5 Land Track or J3.2 Air Track messages for closest friendly or neutral ground and optionally air positions

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)



### SP5-TIN-174 -> Consume FFI MTF messages Consumer

#### SP5-SREQ-129 -> The Ground-to-Air Service shall receive ground tracks from the mission network.

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-151 -> The Ground-to-Air Service shall store received ground tracks and maintain track records.

- TCA-CIAV-016559 -> Ground-to-Air Service stores ground tracks

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-438 -> Events shall be logged on all G2A SA Systems.

- TCA-CIAV-016559 -> Ground-to-Air Service stores ground tracks

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-442 -> Friendly PLI is assumed to be at a lower or the same security level as the communication network used to forward the PLI to the G2A SA service and shall be releasable to the tactical data link domain of the weapon delivery assets.

- TCA-CIAV-016559 -> Ground-to-Air Service stores ground tracks

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-550 -> The Ground-to-Air Service shall be included in the FFT network as FFT consumer without any need for modifications to existing FFT network.

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)

#### SP5-SREQ-93 -> All ADatP-36 messages shall be labelled with the classification and the releasability.

- TCA-CIAV-016560 -> Ground-to-Air Service receives ground tracks

- TCA-CIAV-017438 -> Ground-to-Air Information Exchange (IER-468)



## SP5-SI-GEO -> Geospatial Information

### SP5-TIN-1 -> Geospatial Data Dissemination Collaborator

#### SP5-SREQ-1216 -> Geospatial information shall be disseminated together with the corresponding geospatial metadata.

- TCA-CIAV-016930 -> Ingestion of JPEG 2000 files

- TCA-CIAV-017471 -> Geographic Location Coordinates (IER-63)

- TCA-CIAV-017515 -> Digital GI Submission Package

- TCA-CIAV-017516 -> Provision of Geospatial Data Formats

- TCA-CIAV-017519 -> Digital GI Designation letter - via Digital GI package (Primary)

- TCA-CIAV-017522 -> Designated GI Dissemination Package shared by removable media (Primary)

#### SP5-SREQ-318 -> Geospatial information shall be disseminated using standardized file formats.

- TCA-CIAV-016930 -> Ingestion of Geospatail Data Formats

- TCA-CIAV-016930 -> Ingestion of JPEG 2000 files

- TCA-CIAV-017471 -> Geographic Location Coordinates (IER-63)

- TCA-CIAV-017515 -> Digital GI Submission Package

- TCA-CIAV-017516 -> Provision of Geospatial Data Formats

- TCA-CIAV-017519 -> Digital GI Designation letter - via Digital GI package (Primary)

- TCA-CIAV-017522 -> Designated GI Dissemination Package shared by removable media (Primary)

#### SP5-SREQ-319 -> Mixed geospatial information packages shall be disseminated using standardized geo-database file formats.

- TCA-CIAV-016930 -> Ingestion of Geospatail Data Formats

- TCA-CIAV-017471 -> Geographic Location Coordinates (IER-63)

- TCA-CIAV-017515 -> Digital GI Submission Package

- TCA-CIAV-017516 -> Provision of Geospatial Data Formats

- TCA-CIAV-017519 -> Digital GI Designation letter - via Digital GI package (Primary)

- TCA-CIAV-017522 -> Designated GI Dissemination Package shared by removable media (Primary)



### SP5-TIN-2 -> Geospatial Products Registration and Discovery Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-017520 -> Update Mission GI GAP and Publish in Web Portal (Primary)

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-017520 -> Update Mission GI GAP and Publish in Web Portal (Primary)



### SP5-TIN-2 -> Geospatial Products Registration and Discovery Provider

#### SP5-SREQ-1217 -> Portal users shall be able to automatically import metadata in a standard format.

- TCA-CIAV-016973 -> Consumer - Validate remote portal capabilities

- TCA-CIAV-016974 -> Consumer - Federated portal Basic & Metadata discovery

- TCA-CIAV-017520 -> Update Mission GI GAP and Publish in Web Portal (Primary)

#### SP5-SREQ-320 -> Portal users shall be able to manually register geospatial products and services metadata.

- TCA-CIAV-016968 -> Provide Local Geospatial metadata portal

- TCA-CIAV-016973 -> Consumer - Validate remote portal capabilities

- TCA-CIAV-016974 -> Consumer - Federated portal Basic & Metadata discovery

- TCA-CIAV-017520 -> Update Mission GI GAP and Publish in Web Portal (Primary)

#### SP5-SREQ-321 -> Portal users shall be able to manually download geospatial information from the portal

- TCA-CIAV-016968 -> Provide Local Geospatial metadata portal

- TCA-CIAV-016973 -> Consumer - Validate remote portal capabilities

- TCA-CIAV-016974 -> Consumer - Federated portal Basic & Metadata discovery

- TCA-CIAV-016975 -> Consumer - Federated geospatial information download

- TCA-CIAV-017520 -> Update Mission GI GAP and Publish in Web Portal (Primary)

#### SP5-SREQ-322 -> Portal users shall be able to search for geospatial products and services metadata.

- TCA-CIAV-016968 -> Provide Local Geospatial metadata portal

- TCA-CIAV-016973 -> Consumer - Validate remote portal capabilities

- TCA-CIAV-016974 -> Consumer - Federated portal Basic & Metadata discovery

- TCA-CIAV-016975 -> Consumer - Federated geospatial information download

- TCA-CIAV-017520 -> Update Mission GI GAP and Publish in Web Portal (Primary)



### SP5-TIN-3 -> Web Map Service Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-016942 -> Validate local Web Map Service HTTPS integration

- TCA-CIAV-016980 -> Validate local Web Tile Service HTTPS integration

- TCA-CIAV-017524 -> Designated GI Dissemination Package - WMS (Alternative)

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-016942 -> Validate local Web Map Service HTTPS integration

- TCA-CIAV-016980 -> Validate local Web Tile Service HTTPS integration

- TCA-CIAV-017524 -> Designated GI Dissemination Package - WMS (Alternative)

#### SP5-SREQ-486 -> The Web Map Service Consumer shall be able to request over a network and display selected map images.

- TCA-CIAV-016933 -> Consumer - WMS Output formats for GetMap request

- TCA-CIAV-016934 -> Consumer - Validate WMS version

- TCA-CIAV-016935 -> Harmonized Basic WMS Language

- TCA-CIAV-016936 -> Harmonized Basic WMS Request Parameters - Exceptions 

- TCA-CIAV-016937 -> Harmonized Basic WMS GetCapabilites Response

- TCA-CIAV-016938 -> Consumer - Validate remote WMS Capabilities

- TCA-CIAV-016939 -> Harmonized Basic WMS Acceptable Formats & Languages

- TCA-CIAV-016941 ->  Validate local WMS Capabilities

- TCA-CIAV-016944 -> Consumer - Check remote server communications

- TCA-CIAV-016945 -> Consumer - WMS basic & queryable

- TCA-CIAV-016946 -> Harmonized Basic WMS

- TCA-CIAV-016947 -> Harmonized Basic WMS Coordinate Reference Systems (CRS) (Harmonized Requirement 5)

- TCA-CIAV-016948 -> Harmonized Basic WMS Messaging Service SIP

- TCA-CIAV-016976 -> Harmonized Basic WMS Output Format

- TCA-CIAV-017446 -> DNS records check for WMS server

- TCA-CIAV-017524 -> Designated GI Dissemination Package - WMS (Alternative)



### SP5-TIN-3 -> Web Map Service Provider

#### SP5-SREQ-487 -> The Web Map Service Provider shall respond to requests for selected map images over a network.

- TCA-CIAV-016933 -> Consumer - WMS Output formats for GetMap request

- TCA-CIAV-016934 -> Consumer - Validate WMS version

- TCA-CIAV-016935 -> Harmonized Basic WMS Language

- TCA-CIAV-016936 -> Harmonized Basic WMS Request Parameters - Exceptions 

- TCA-CIAV-016937 -> Harmonized Basic WMS GetCapabilites Response

- TCA-CIAV-016938 -> Consumer - Validate remote WMS Capabilities

- TCA-CIAV-016939 -> Harmonized Basic WMS Acceptable Formats & Languages

- TCA-CIAV-016940 -> Provide local Web Map Service

- TCA-CIAV-016941 ->  Validate local WMS Capabilities

- TCA-CIAV-016942 -> Validate local Web Map Service HTTPS integration

- TCA-CIAV-016943 -> Validate local Web Map Service CORS implementation

- TCA-CIAV-016944 -> Consumer - Check remote server communications

- TCA-CIAV-016945 -> Consumer - WMS basic & queryable

- TCA-CIAV-016946 -> Harmonized Basic WMS

- TCA-CIAV-016947 -> Harmonized Basic WMS Coordinate Reference Systems (CRS) (Harmonized Requirement 5)

- TCA-CIAV-016948 -> Harmonized Basic WMS Messaging Service SIP

- TCA-CIAV-016976 -> Harmonized Basic WMS Output Format

- TCA-CIAV-017310 -> Time synchronisation

- TCA-CIAV-017312 -> Communications

- TCA-CIAV-017446 -> DNS records check for WMS server

- TCA-CIAV-017524 -> Designated GI Dissemination Package - WMS (Alternative)



### SP5-TIN-4 -> Web Feature Service Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-016962 -> Validate local Web Feature Service HTTPS integration

- TCA-CIAV-017523 -> Designated GI Dissemination Package - WFS (Alternative)

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-016962 -> Validate local Web Feature Service HTTPS integration

- TCA-CIAV-017523 -> Designated GI Dissemination Package - WFS (Alternative)

#### SP5-SREQ-488 -> The Web Feature Service Consumer shall be able to retrieve, display, create and modify spatial features over a network.

- TCA-CIAV-016959 -> Consumer - Validate WFS version

- TCA-CIAV-016960 -> [WFS] Validate local WFS Capabilities

- TCA-CIAV-016963 -> Validate local Web Feature Service CORS implementation

- TCA-CIAV-016964 -> Validate Vector data publication in WFS

- TCA-CIAV-016966 -> Consumer - Check remote server communications

- TCA-CIAV-016967 -> Consumer - WFS Basic

- TCA-CIAV-017318 -> Conformance Class

- TCA-CIAV-017448 -> DNS records check for WFS server

- TCA-CIAV-017523 -> Designated GI Dissemination Package - WFS (Alternative)



### SP5-TIN-4 -> Web Feature Service Provider

#### SP5-SREQ-489 -> The Web Feature Service Provider shall respond to requests to retrieve, create and modify spatial features over a network.

- TCA-CIAV-016959 -> Consumer - Validate WFS version

- TCA-CIAV-016960 -> [WFS] Validate local WFS Capabilities

- TCA-CIAV-016961 -> [WFS] Provide local Web Feature Service

- TCA-CIAV-016962 -> Validate local Web Feature Service HTTPS integration

- TCA-CIAV-016963 -> Validate local Web Feature Service CORS implementation

- TCA-CIAV-016964 -> Validate Vector data publication in WFS

- TCA-CIAV-016966 -> Consumer - Check remote server communications

- TCA-CIAV-016967 -> Consumer - WFS Basic

- TCA-CIAV-017310 -> Time synchronisation

- TCA-CIAV-017312 -> Communications

- TCA-CIAV-017318 -> Conformance Class

- TCA-CIAV-017448 -> DNS records check for WFS server

- TCA-CIAV-017523 -> Designated GI Dissemination Package - WFS (Alternative)



### SP5-TIN-5 -> Web Map Tile Service Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-016980 -> Validate local Web Tile Service HTTPS integration

- TCA-CIAV-017525 -> Designated GI Dissemination Package - WMTS (Alternative)

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-016980 -> Validate local Web Tile Service HTTPS integration

- TCA-CIAV-017525 -> Designated GI Dissemination Package - WMTS (Alternative)

#### SP5-SREQ-490 -> The Web Map Tile Service Consumer shall be able to request and display pre-rendered georeferenced map tiles over a network.

- TCA-CIAV-016977 -> Consumer - Validate WMTS version

- TCA-CIAV-016978 -> Validate local WMTS Capabilities

- TCA-CIAV-016981 -> Validate local Web Map Tile Service CORS implementation

- TCA-CIAV-016984 -> Harmonized WMTS WKSS support 

- TCA-CIAV-016985 -> Harmonized WMTS Raster Formats

- TCA-CIAV-016986 -> Harmonized WMTS Keyword List

- TCA-CIAV-016987 -> Harmonized WMTS Language 

- TCA-CIAV-016988 -> Harmonized WMTS GetCapabilities

- TCA-CIAV-016989 ->  Harmonized WMTS Tile Expiration Date 

- TCA-CIAV-016990 ->  Harmonized WMTS Metadata

- TCA-CIAV-016992 -> Harmonized WMTS Messaging Service SIP

- TCA-CIAV-016993 -> Consumer - Check remote server communications

- TCA-CIAV-016994 -> Consumer - Validate remote WMTS Capabilities

- TCA-CIAV-016995 -> Consumer - WMTS REST Basic

- TCA-CIAV-017439 -> DNS records check for WMTS server

- TCA-CIAV-017525 -> Designated GI Dissemination Package - WMTS (Alternative)



### SP5-TIN-5 -> Web Map Tile Service Provider

#### SP5-SREQ-491 -> The Web Map Tile Service Provider shall respond to requests for pre-rendered georeferenced map tiles over a network.

- TCA-CIAV-016977 -> Consumer - Validate WMTS version

- TCA-CIAV-016978 -> Validate local WMTS Capabilities

- TCA-CIAV-016979 -> Provide Local Web Map Tile Service

- TCA-CIAV-016980 -> Validate local Web Tile Service HTTPS integration

- TCA-CIAV-016981 -> Validate local Web Map Tile Service CORS implementation

- TCA-CIAV-016983 -> Harmonized WMTS KVP and RESTful Support 

- TCA-CIAV-016984 -> Harmonized WMTS WKSS support 

- TCA-CIAV-016985 -> Harmonized WMTS Raster Formats

- TCA-CIAV-016986 -> Harmonized WMTS Keyword List

- TCA-CIAV-016987 -> Harmonized WMTS Language 

- TCA-CIAV-016988 -> Harmonized WMTS GetCapabilities

- TCA-CIAV-016989 ->  Harmonized WMTS Tile Expiration Date 

- TCA-CIAV-016990 ->  Harmonized WMTS Metadata

- TCA-CIAV-016992 -> Harmonized WMTS Messaging Service SIP

- TCA-CIAV-016993 -> Consumer - Check remote server communications

- TCA-CIAV-016994 -> Consumer - Validate remote WMTS Capabilities

- TCA-CIAV-016995 -> Consumer - WMTS REST Basic

- TCA-CIAV-017310 -> Time synchronisation

- TCA-CIAV-017312 -> Communications

- TCA-CIAV-017439 -> DNS records check for WMTS server

- TCA-CIAV-017525 -> Designated GI Dissemination Package - WMTS (Alternative)



### SP5-TIN-6 -> Geospatial Web Feeds Consumer

#### SP5-SREQ-410 -> The Web Hosting Services clients shall be able to consume provided geospatial content (encoding of location and geospatial feeds).

- TCA-CIAV-016971 -> Consumer - Validate portal Web Feeds profiles (GEO RSS) implementation



### SP5-TIN-6 -> Geospatial Web Feeds Provider

#### SP5-SREQ-409 -> The Web Hosting Services shall support exposing of geospatial content (encoding of location and geospatial feeds)

- TCA-CIAV-016971 -> Consumer - Validate portal Web Feeds profiles (GEO RSS) implementation



## SP5-SI-IBOX -> Intelligence Battlespace Objects Exchange

### SP5-TIN-371 -> Intelligence BsO Synchronization Consumer

#### SP5-SREQ-1252 -> The Intelligence BsO consumer shall be able to filter intelligence BsO based on status and associated attributes.

- TCA-CIAV-014456 -> 05. Create versions of instance-objetcts

#### SP5-SREQ-1253 -> The intelligence BsO consumer must be able to update/change the metadata of an intelligence BsO.

- TCA-CIAV-014465 -> 03. Create relations between type-objects

- TCA-CIAV-014466 -> 06. Create relations between instance-objects.

#### SP5-SREQ-1260 -> Strict data and metadata format validations, compliant with STANAG 2433, shall be conducted on all data prior to ingest. Non-compliant information shall be dropped.

- TCA-CIAV-014111 -> 01. Ingest type-objects of five classes.

- TCA-CIAV-014452 -> 02. Create versions of type-objetcs

- TCA-CIAV-014454 -> 04. Ingest instance-objects of five classes.

- TCA-CIAV-014465 -> 03. Create relations between type-objects



### SP5-TIN-371 -> Intelligence BsO Synchronization Provider

#### SP5-SREQ-1244 -> Intelligence BsO Service provider shall implement their own authentication mechanisms to allow access only to trusted clients.

- TCA-CIAV-016884 -> 00. Verify BsO Synch Prerequisites.

#### SP5-SREQ-1245 -> Intelligence BsO servers SHALL be located and resolvable via the Domain Naming Service.

- TCA-CIAV-016884 -> 00. Verify BsO Synch Prerequisites.

#### SP5-SREQ-1246 -> Local Intelligence BsO Server Administrator must be able to configure the Server Settings in accordance with the JMEI provided.

- TCA-CIAV-014467 -> 01. Configure and verify Intelligence BsO syncronization

#### SP5-SREQ-1247 -> Local Intelligence BsO Server Administrator must be able to create/establish local Server accounts.

#### SP5-SREQ-1248 -> Local Intelligence BsO Server Administrator must be able to ensure HTTP/HTTPS Web Services Interface is operational.

- TCA-CIAV-014467 -> 01. Configure and verify Intelligence BsO syncronization

#### SP5-SREQ-1249 -> Local Intelligence BsO Server Administrator must be able to create/establish Server Synchronization Account for each federated Server as stated in the JMEI.

- TCA-CIAV-014467 -> 01. Configure and verify Intelligence BsO syncronization

#### SP5-SREQ-1250 -> Local Intelligence BsO Server Administrator must be able to configure synchronization parameters of federated Server(s) as stated in the JMEI.

- TCA-CIAV-014467 -> 01. Configure and verify Intelligence BsO syncronization

#### SP5-SREQ-1251 -> Local Intelligence BsO Server Administrator must be able to initiate and verify synchronization between local and federated server(s).

- TCA-CIAV-014467 -> 01. Configure and verify Intelligence BsO syncronization

- TCA-CIAV-014493 -> 01. Basic one-way object sync test

- TCA-CIAV-014497 -> 03. Basic two-way object sync test

- TCA-CIAV-014498 -> 02. Basic one-way relation synchronization test.

- TCA-CIAV-014527 -> 04. Basic two-way relation synchronization test.

#### SP5-SREQ-1254 -> All battlespace objects held within, and exchanged between, intelligence structured databases shall carry confidentiality labels compliant with STANAG 4774.

#### SP5-SREQ-1255 -> Need-to-know for Intelligence BsOs shall be managed based on their respective releasability label.

#### SP5-SREQ-1256 -> Intelligence BsO databases shall mutually authenticate using certificates and using system account credentials at the application level.

- TCA-CIAV-014467 -> 01. Configure and verify Intelligence BsO syncronization

#### SP5-SREQ-1257 -> Intelligence BsO providers shall implement their own authentication mechanisms to allow access only to trusted clients.

- TCA-CIAV-016884 -> 00. Verify BsO Synch Prerequisites.

#### SP5-SREQ-1258 -> All intelligence BsO databases shall log all security events, including as a minimum all exceptional events.

- TCA-CIAV-016884 -> 00. Verify BsO Synch Prerequisites.

#### SP5-SREQ-1259 -> All synchronization between Intelligence BsO Databases shall be secured in transit (https).

- TCA-CIAV-014467 -> 01. Configure and verify Intelligence BsO syncronization



## SP5-SI-INFOEX -> Fires Information Exchange

### SP5-TIN-318 -> Kinetic Indirect Fire Support Collaborator

#### SP5-SREQ-1091 -> Indirect Fire Support Service port range shall be 6411-6417. Default value is 6413.

#### SP5-SREQ-1146 -> ASCA/CTIDP message shall be labelled with classification.

#### SP5-SREQ-1147 -> ASCA Gateways shall filter ASCA/CTIDP messages and only permit ASCA/CTIDP interactions by known/configured IP adresses and NATO Aliases.

Note: this requirement mainly applies to the application stack that processes ASCA/CTIDP messages; it does not imply that ASCA gateways are single-tasking: depending on national choices, a software ASCA gateway can be integrated into a multi-service network gateway.

#### SP5-SREQ-1150 -> ASCA Gateways must log security events.

#### SP5-SREQ-1151 -> Network Interconnection Points (NIPs) shall be locally provided to enable interconnections between ASCA Gateways on different national extensions, for each federated Joint Fire Support Elements (f-JFSE) or multinational Artillery Command Posts over the Coalition Deployment.

To decide the number and location of f-JFSEs or multinational Artillery Command Posts, the Task Organization of the multinational Force, especially related to the Artillery and Fire Support deployment, has precedence to any technical consideration, even regarding possible optimized coalition network topology.

#### SP5-SREQ-1152 -> ASCA Gateways shall perform technical coherency checks on ASCA/CTIDP messages.

#### SP5-SREQ-1268 -> ASCA Gateways interconnected through ''Kinetic Indirect Fire Support'' technical interaction (TIN-318) shall be simultaneously connected to their national Fire Control chain in order to provide an end-to-end digital sensor-to-shooter kill chain.



## SP5-SI-JISRIE -> Joint ISR Information Exchange

### SP5-TIN-307 -> Exchange ISR Library data and metadata Consumer

#### SP5-SREQ-291 -> AEDP-17 server users must be able to query (one time as well as standing queries) the network of AEDP-17 servers to identify locally and remotely available ISR products as per the list specified in the Spiral 4 Procedural Instructions for Intelligence and JISR.

- TCA-CIAV-017160 -> REPO-00072-Perform Wildcard Search

- TCA-CIAV-017203 -> REPO-00600-Search one or more Metadata Fields

- TCA-CIAV-017211 -> REPO-00404-Perform Sync Initialization

#### SP5-SREQ-328 -> The ISR Library consumer must be able to discover intelligence products.

- TCA-CIAV-017160 -> REPO-00072-Perform Wildcard Search

- TCA-CIAV-017171 -> REPO-00222-Sort Intel Products List

- TCA-CIAV-017180 -> REPO-00342-Set Delivery Destination for download

- TCA-CIAV-017182 -> REPO-05297-Verify Successful Local Publication of All Types of Intel Products

- TCA-CIAV-017202 -> REPO-00594-Filter Intel Products List

- TCA-CIAV-017203 -> REPO-00600-Search one or more Metadata Fields

- TCA-CIAV-017216 -> REPO-00182-Verify that local search results match list from remote library

- TCA-CIAV-017222 -> REPO-00487-Verify Publish Single Intel Product

- TCA-CIAV-017223 -> REPO-05331-Verify Mark Local Intel Product Obsolete is Synchronized to Remote Library

#### SP5-SREQ-329 -> The ISR Library consumer must be able to download/retrieve an intelligence product on an AEDP-17 Server.

- TCA-CIAV-017180 -> REPO-00342-Set Delivery Destination for download

- TCA-CIAV-017215 -> REPO-00135-Download single intel product from remote library

- TCA-CIAV-017219 -> REPO-00423-Verify Invalid Download Order Notification

- TCA-CIAV-017221 -> REPO-00486-Verify Image Chipping

- TCA-CIAV-017222 -> REPO-00487-Verify Publish Single Intel Product

#### SP5-SREQ-330 -> The AEDP-17 server consumer must be able to publish an intelligence product on a AEDP-17 Server

- TCA-CIAV-017165 -> REPO-00123-Verify Published Product Metadata Matches Input

- TCA-CIAV-017175 -> REPO-00281-Verify Intel Product Association

- TCA-CIAV-017182 -> REPO-05297-Verify Successful Local Publication of All Types of Intel Products

- TCA-CIAV-017204 -> REPO-00607-Verify Unsuccessful Publish Notification

#### SP5-SREQ-331 -> The AEDP-17 server consumer must be able to update/change the metadata of an intelligence product on a CSD-Server.

- TCA-CIAV-017150 -> REPO-00015-Verify Successful Metadata Update

- TCA-CIAV-017151 -> REPO-00018-Verify Editable Metadata Values

- TCA-CIAV-017155 -> REPO-00039-Verify Unsuccessful Metadata Update Notification

- TCA-CIAV-017168 -> REPO-00187-Verify Multi-Metadata Value Update-Single Intel Product

- TCA-CIAV-017187 -> REPO-00402-Verify Mark Local Intel Product as Obsolete

- TCA-CIAV-017205 -> REPO-00612-Provide privilege to update Product Metadata

- TCA-CIAV-017223 -> REPO-05331-Verify Mark Local Intel Product Obsolete is Synchronized to Remote Library



### SP5-TIN-307 -> Exchange ISR Library data and metadata Provider

#### SP5-SREQ-1236 -> All data objects held within, and exchanged between, NATO Standard ISR Libraries (NSILs) shall carry confidentiality labels compliant with STANAG 4774.

#### SP5-SREQ-1237 -> Need-to-know for Intelligence and ISR products as well as for associated metadata cards shall be managed based on their respective releasability to the specific MNP NSILs.

#### SP5-SREQ-1238 -> NSILs shall mutually authenticate using certificates and using system account credentials at the application level.

- TCA-CIAV-017208 -> REPO-00287-Setup Synchronization Services Accounts

#### SP5-SREQ-1239 -> All NSILs shall log all security events, including as a minimum all exceptional events.

#### SP5-SREQ-1240 -> All synchronization between NSILs shall be secured in transit (https).

#### SP5-SREQ-1241 -> All user access to NSILs shall be secured in transit (https).

#### SP5-SREQ-1242 -> Agreements between MNPs captured at MOU level, and in JMEIs, for intelligence information sharing, shall be enforced.

#### SP5-SREQ-1243 -> Strict data and metadata format validations, compliant with STANAG 4559, shall be conducted on all data prior to ingest. Non-compliant information shall be dropped.

#### SP5-SREQ-265 -> Local AEDP-17 Server Administrator must be able to configure local AEDP-17 Server Settings, using the JMEI provided.

- TCA-CIAV-017161 -> REPO-00092-Config CSD-Server Library Description

- TCA-CIAV-017177 -> REPO-00304-Access the CSD-Server Library via CSD-Client

- TCA-CIAV-017183 -> REPO-00366-Config CORBA Port

- TCA-CIAV-017184 -> REPO-00369-Config CSD-Server security markings

- TCA-CIAV-017200 -> REPO-00558-Config SSL/TLS Cert / Config HTTPS

- TCA-CIAV-017206 -> REPO-00621-Config CSD-Server Library ID

#### SP5-SREQ-266 -> Local AEDP-17 Server Administrator must be able to create/establish local AEDP-17 Server accounts.

- TCA-CIAV-017162 -> REPO-00096-Verify Publishing Privileges

- TCA-CIAV-017177 -> REPO-00304-Access the CSD-Server Library via CSD-Client

- TCA-CIAV-017190 -> REPO-00432-Create User Local Account

#### SP5-SREQ-267 -> AEDP-17 Server Administrator must be able to ensure the NATO Standard ISR Library Interface is operational

- TCA-CIAV-017166 -> REPO-00149-Verify Return of IOR String

- TCA-CIAV-017177 -> REPO-00304-Access the CSD-Server Library via CSD-Client

- TCA-CIAV-017180 -> REPO-00342-Set Delivery Destination for download

- TCA-CIAV-017182 -> REPO-05297-Verify Successful Local Publication of All Types of Intel Products

- TCA-CIAV-017203 -> REPO-00600-Search one or more Metadata Fields

#### SP5-SREQ-268 -> AEDP-17 Server Administrator must be able to ensure HTTP/HTTPS Web Services Interface is operational

- TCA-CIAV-017177 -> REPO-00304-Access the CSD-Server Library via CSD-Client

- TCA-CIAV-017182 -> REPO-05297-Verify Successful Local Publication of All Types of Intel Products

- TCA-CIAV-017185 -> REPO-00386-Check HTTPS Web Services Interface Ops - Query

- TCA-CIAV-017198 -> REPO-00510-Check HTTPS Web Services Interface Ops - Publish

- TCA-CIAV-017200 -> REPO-00558-Config SSL/TLS Cert / Config HTTPS

- TCA-CIAV-017203 -> REPO-00600-Search one or more Metadata Fields

- TCA-CIAV-017212 -> REPO-05665-Config Remote Streaming Systems Certificates 

- TCA-CIAV-017214 -> REPO-05318-Config Remote Systems Certificates 

- TCA-CIAV-017222 -> REPO-00487-Verify Publish Single Intel Product

#### SP5-SREQ-269 -> Local AEDP-17 Server Administrator must be able to create/establish AEDP-17 Server Synchronization Account for each federated AEDP-17 Server as stated in the JMEI.

- TCA-CIAV-017208 -> REPO-00287-Setup Synchronization Services Accounts

- TCA-CIAV-017211 -> REPO-00404-Perform Sync Initialization

- TCA-CIAV-017222 -> REPO-00487-Verify Publish Single Intel Product

#### SP5-SREQ-270 -> AEDP-17 Server Administrator must be able to configure synchronization parameters of federated AEDP-17 Server(s) as stated in the JMEI.

- TCA-CIAV-017210 -> REPO-00330-Input Remote CSD IOR URL and Remote Library ID(s) for synchronization

- TCA-CIAV-017222 -> REPO-00487-Verify Publish Single Intel Product

#### SP5-SREQ-271 -> AEDP-17 Server Administrator must be able to initiate and verify synchronization between local and federated AEDP-17 server(s).

- TCA-CIAV-017211 -> REPO-00404-Perform Sync Initialization

- TCA-CIAV-017222 -> REPO-00487-Verify Publish Single Intel Product

#### SP5-SREQ-303 -> An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted for the Mission Network.

#### SP5-SREQ-304 -> Access to the functionality provided by the service interfaces described in this document shall be controlled using the “Username Token Profile 1.1” [OASIS WS-Security UsernameToken 1.1, 2006] that has been agreed to be mandatory for all SOAP operations in all interfaces. A service shall throw an “Access Denied” exception if it does not receive sufficient credentials.

- TCA-CIAV-017177 -> REPO-00304-Access the CSD-Server Library via CSD-Client

#### SP5-SREQ-305 -> ISR Service provider shall implement their own authentication mechanisms to allow access only to trusted clients.

- TCA-CIAV-017177 -> REPO-00304-Access the CSD-Server Library via CSD-Client

#### SP5-SREQ-512 -> Servers shall mutually authenticate using certificates

- TCA-CIAV-017191 -> REPO-05317-Config SSL Cert / Config HTTPS for CSD Streaming Server

#### SP5-SREQ-601 -> AEDP-17 servers SHALL be located and resolvable via the Domain Naming Service.

- TCA-CIAV-017166 -> REPO-00149-Verify Return of IOR String

- TCA-CIAV-017185 -> REPO-00386-Check HTTPS Web Services Interface Ops - Query

- TCA-CIAV-017198 -> REPO-00510-Check HTTPS Web Services Interface Ops - Publish



### SP5-TIN-308 -> ISR Streaming Services Access Consumer

#### SP5-SREQ-323 -> CSD-Stream server consumer must be able relay, replay and download streams via a Stream Controller Service Interface.

- TCA-CIAV-017209 -> REPO-03452-Verify transmission of streams from remote server to local client based on client request

#### SP5-SREQ-324 -> CSD-Stream server consumer must be able to request notification on the availability of streamed data using the Workflow Services Business Rules regarding topic, dialect and namespace.

- TCA-CIAV-017209 -> REPO-03452-Verify transmission of streams from remote server to local client based on client request

#### SP5-SREQ-325 -> ISR Streaming consumer must be able to discover live and recorded ISR Stream.

- TCA-CIAV-017159 -> REPO-05660-Verify transmission of GMTI streams from server to local client

- TCA-CIAV-017163 -> REPO-03463-View a list of all live ISR streams

- TCA-CIAV-017167 -> REPO-05661-Verify transmission of Link16 (JREAP-C) streams from server to local client

- TCA-CIAV-017169 -> REPO-05655-Verify detection, capture & storage of incoming GMTI stream on unicast

- TCA-CIAV-017173 -> REPO-03480-(remove  end date;)Sort the list of all live ISR streams

- TCA-CIAV-017174 -> REPO-05659-Verify detection, capture & storage of incoming JREAP-C streams on multicast

- TCA-CIAV-017176 -> REPO-03408-Sort the list of all recorded ISR streams

- TCA-CIAV-017178 -> REPO-03406-Search for recorded ISR streams utilizing a wildcard character

- TCA-CIAV-017186 -> REPO-03405-Filter the list of all recorded ISR streams

- TCA-CIAV-017188 -> REPO-03448-Verify detection, capture & storage of incoming FMV stream on unicast

- TCA-CIAV-017189 -> REPO-03403-View a list of all recorded ISR streams

- TCA-CIAV-017193 -> REPO-03449-Verify transmission of FMV streams from server to local client

- TCA-CIAV-017194 -> REPO-05656-Verify detection, capture & storage of incoming JREAP-C streams on unicast

- TCA-CIAV-017197 -> REPO-05658-Verify detection, capture & storage of incoming GMTI streams on multicast

- TCA-CIAV-017201 -> REPO-05657-Verify detection, capture & storage of incoming FMV stream on multicast

- TCA-CIAV-017207 -> REPO-05319-Verify transmission of live streams from remote server to local server 

- TCA-CIAV-017209 -> REPO-03452-Verify transmission of streams from remote server to local client based on client request

- TCA-CIAV-017213 -> REPO-03451-Verify transmission of stored streams from remote server to local server

- TCA-CIAV-017218 -> REPO-03472-Filter the list of all live ISR streams from remote servers

#### SP5-SREQ-326 -> ISR streaming consumer must be able to record and relay a live ISR stream and replay recorded ones.

- TCA-CIAV-017154 -> REPO-03464-Start/Stop Recording of Live Multicast ISR Stream

- TCA-CIAV-017157 -> REPO-03457- (Delete this one) Start/Stop Multicast Replay of a Recorded ISR stream

- TCA-CIAV-017164 -> REPO-03465-Start/Stop Recording of Live Unicast ISR Stream

- TCA-CIAV-017170 -> REPO-05662- (Remove "Remote" in title) Start/Stop remote Multicast Replay of a Recorded ISR stream

- TCA-CIAV-017196 -> REPO-05664- (Remove "remote" from the title) Start/Stop remote unicast Replay of a Recorded ISR stream

- TCA-CIAV-017209 -> REPO-03452-Verify transmission of streams from remote server to local client based on client request

- TCA-CIAV-017217 -> REPO-03470-Start/Stop Relaying of Live Multicast ISR Stream

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-327 -> ISR Streaming consumer must be able to update the metadata of a live or recorded ISR stream.



### SP5-TIN-308 -> ISR Streaming Services Access Provider

#### SP5-SREQ-1242 -> Agreements between MNPs captured at MOU level, and in JMEIs, for intelligence information sharing, shall be enforced.

#### SP5-SREQ-1243 -> Strict data and metadata format validations, compliant with STANAG 4559, shall be conducted on all data prior to ingest. Non-compliant information shall be dropped.

#### SP5-SREQ-272 -> AEDP-18 ISR Streaming Server Administrator must be able to create/establish AEDP-18 ISR Streaming Server replication account for each federated AEDP-18 ISR Streaming Server as stated in the JMEI.

- TCA-CIAV-017217 -> REPO-03470-Start/Stop Relaying of Live Multicast ISR Stream

- TCA-CIAV-017218 -> REPO-03472-Filter the list of all live ISR streams from remote servers

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

- TCA-CIAV-017509 -> (NEW) Streaming Server Administrator must be able to create establish AEDP-18 ISR Streaming Server replication account

#### SP5-SREQ-273 -> AEDP-18 ISR Streaming Server Administrator must be able to ensure that data streaming endpoints are configured as stated in the JMEI.

- TCA-CIAV-017158 -> REPO-03444-Config Incoming Stream parameters

- TCA-CIAV-017172 -> REPO-05316-Config Streaming Server Security Markings

- TCA-CIAV-017192 -> REPO-03445-Config Local Streaming Server according to JMEI

- TCA-CIAV-017217 -> REPO-03470-Start/Stop Relaying of Live Multicast ISR Stream

- TCA-CIAV-017218 -> REPO-03472-Filter the list of all live ISR streams from remote servers

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-274 -> The AEDP-18 ISR Streaming Server administrator must be able to ensure ISR Stream Publishing service is operational.

- TCA-CIAV-017181 -> REPO-03504-Verify that the Stream Controller, Query and Publish interfaces are operational - HTTPS

- TCA-CIAV-017217 -> REPO-03470-Start/Stop Relaying of Live Multicast ISR Stream

- TCA-CIAV-017218 -> REPO-03472-Filter the list of all live ISR streams from remote servers

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-275 -> The AEDP-18 ISR Streaming Server administrator must be able to ensure ISR Stream Querying service is operational.

- TCA-CIAV-017181 -> REPO-03504-Verify that the Stream Controller, Query and Publish interfaces are operational - HTTPS

- TCA-CIAV-017217 -> REPO-03470-Start/Stop Relaying of Live Multicast ISR Stream

- TCA-CIAV-017218 -> REPO-03472-Filter the list of all live ISR streams from remote servers

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-276 -> The AEDP-18 ISR Streaming Server administrator must be able to ensure ISR Stream Control service is operational.

- TCA-CIAV-017181 -> REPO-03504-Verify that the Stream Controller, Query and Publish interfaces are operational - HTTPS

- TCA-CIAV-017218 -> REPO-03472-Filter the list of all live ISR streams from remote servers

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-277 -> The AEDP-18 ISR Streaming Server administrator must be able to ensure ISR Stream Notification service is operational.

- TCA-CIAV-017218 -> REPO-03472-Filter the list of all live ISR streams from remote servers

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-278 -> The AEDP-18 ISR Streaming Server administrator must be able to ensure ISR Stream Replication service is operational.

- TCA-CIAV-017169 -> REPO-05655-Verify detection, capture & storage of incoming GMTI stream on unicast

- TCA-CIAV-017174 -> REPO-05659-Verify detection, capture & storage of incoming JREAP-C streams on multicast

- TCA-CIAV-017188 -> REPO-03448-Verify detection, capture & storage of incoming FMV stream on unicast

- TCA-CIAV-017194 -> REPO-05656-Verify detection, capture & storage of incoming JREAP-C streams on unicast

- TCA-CIAV-017197 -> REPO-05658-Verify detection, capture & storage of incoming GMTI streams on multicast

- TCA-CIAV-017201 -> REPO-05657-Verify detection, capture & storage of incoming FMV stream on multicast

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-279 -> The AEDP-18 ISR Streaming Server administrator must be able to verify that the end user is able to successfully consume streaming data of the types specified in the JMEI (Link 16, FMV, GMTI).

- TCA-CIAV-017159 -> REPO-05660-Verify transmission of GMTI streams from server to local client

- TCA-CIAV-017167 -> REPO-05661-Verify transmission of Link16 (JREAP-C) streams from server to local client

- TCA-CIAV-017169 -> REPO-05655-Verify detection, capture & storage of incoming GMTI stream on unicast

- TCA-CIAV-017174 -> REPO-05659-Verify detection, capture & storage of incoming JREAP-C streams on multicast

- TCA-CIAV-017188 -> REPO-03448-Verify detection, capture & storage of incoming FMV stream on unicast

- TCA-CIAV-017193 -> REPO-03449-Verify transmission of FMV streams from server to local client

- TCA-CIAV-017194 -> REPO-05656-Verify detection, capture & storage of incoming JREAP-C streams on unicast

- TCA-CIAV-017197 -> REPO-05658-Verify detection, capture & storage of incoming GMTI streams on multicast

- TCA-CIAV-017201 -> REPO-05657-Verify detection, capture & storage of incoming FMV stream on multicast

- TCA-CIAV-017207 -> REPO-05319-Verify transmission of live streams from remote server to local server 

- TCA-CIAV-017209 -> REPO-03452-Verify transmission of streams from remote server to local client based on client request

- TCA-CIAV-017213 -> REPO-03451-Verify transmission of stored streams from remote server to local server

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-280 -> The AEDP-18 ISR Streaming Server Administrator must be able to ensure SPS++ Web Service interface is operational.

- TCA-CIAV-017220 -> REPO-03468-Start/Stop Relaying of Live Unicast ISR Stream

#### SP5-SREQ-303 -> An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted for the Mission Network.



## SP5-SI-JREAP -> Data Links

### SP5-TIN-108 -> JREAP Point to Point Collaborator

#### SP5-SREQ-108 -> Connectivity to the JREAP hub shall be limited by JREAP node IDs included on the OPTASKLINK

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-109 -> JREAP nodes must log all events, registering at least: originating node ID; IP address; errors; and user access.

- TCA-CIAV-011937 -> Verify JREU nodes log the following events; user access (logon and logoff)

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

- TCA-CIAV-016857 -> Verify JREU nodes log the following events; originating node ID, IP address, errors, and user access (logon and logoff)

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-110 -> Communication between JREAP nodes shall be secured via accredited crypto devices and keys to the same level as the Link 16 network.

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-011960 -> Verify IP connectivity among partners JRE Processors - Comm Check

- TCA-CIAV-016557 -> Ground-to-Air Service receives J12.6 Target Sorting message from Link 16 network to trigger the service

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-1271 -> A Common Time Reference (CTR) negotiation process must be present to coordinate a common time reference among JREAP nodes. The preferred mechanism will be Coordinated Universal Time (UTC), but Round Trip Time (RTT) will be also supported.

- TCA-CIAV-011941 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN - Using mandatory SP5 Standards

- TCA-CIAV-011951 -> Verify Active JRE Platforms can transmit or forward Drop Track Messages (J7.0) to the Mission Network

- TCA-CIAV-011953 -> [End -to End ] Verify FJUG Active Platforms can generate or forward J-Messages from the L16 network and L16 Display systems can display them

- TCA-CIAV-011954 -> Verify Hub JRE Platforms can forward J-Series messages to all the JRE Platforms connected to the Hub

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

- TCA-CIAV-011956 -> Verify Systems  are synchronized with a federated NTP source - NTP Check

- TCA-CIAV-011957 -> Verify JRE Processors can connect using UTC/RTT as Common Time Reference

- TCA-CIAV-011958 -> Verify Active JRE do not transmit or process received messages requiring extrapolation until CTR is completed

- TCA-CIAV-016857 -> Verify JREU nodes log the following events; originating node ID, IP address, errors, and user access (logon and logoff)

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-671 -> MNP JRE Process PPLI - Each JRE Capable MNP shall be able to process and extrapolate PPLI messages (J2.0 in X1)

- TCA-CIAV-010968 -> Verify Active and Semi-Active JRE Platforms can TX own PPLI Messages J2.X Point to Point

- TCA-CIAV-011952 -> Verify Active JRE Platforms connected to L16 network (FJUG)  can convert a J2.X Direct PPLI to J2.0 Indirect PPLI and forward to the network via Hub

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-672 -> MNP JRE Active platforms - shall be able to transform all J2.x messages into J2.0 and send it to Link-16 capable MNPs, on the MN (as a X1 Message)

- TCA-CIAV-011952 -> Verify Active JRE Platforms connected to L16 network (FJUG)  can convert a J2.X Direct PPLI to J2.0 Indirect PPLI and forward to the network via Hub

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-673 -> MNP JRE  Terminate Link - All platforms shall be able to terminate a JREAP link.

- TCA-CIAV-011943 -> Verify JRE platforms connected to a Hub can exit the JREAP Network and terminate the links (X0.9)

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-675 -> MNP NTP - Federated MNPs DL services shall be synchronized with a difference less than the one indicated by the DL SMA

- TCA-CIAV-011947 -> Verify Systems  are synchronized with a  local NTP source

- TCA-CIAV-011956 -> Verify Systems  are synchronized with a federated NTP source - NTP Check

- TCA-CIAV-011957 -> Verify JRE Processors can connect using UTC/RTT as Common Time Reference

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-678 -> MNP JRE Perform JRE Role - Each JRE capable MNP shall be able to perform at least one of the following JRE roles: FJUG, JRE JU, JREU

- TCA-CIAV-011946 -> Verify JREU (Passive / Semi-Active ) nodes have configured the systems according to OPTASKLINK / JMEI

- TCA-CIAV-011949 -> Verify JRE JU (Active) nodes have configured the systems according to OPTASKLINK / JMEI.

- TCA-CIAV-011953 -> [End -to End ] Verify FJUG Active Platforms can generate or forward J-Messages from the L16 network and L16 Display systems can display them

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-682 -> JRE platforms must comply with ATDLP-5-18(B) extrapolation rules.

- TCA-CIAV-011940 -> Data Link Compliance with SP5 Standards

- TCA-CIAV-011941 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN - Using mandatory SP5 Standards

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

- TCA-CIAV-011958 -> Verify Active JRE do not transmit or process received messages requiring extrapolation until CTR is completed

- TCA-CIAV-017472 -> Single Lady - Copy

#### SP5-SREQ-685 -> MNP JRE Processors that are configured in active or semi-active mode are required to generate their own PPLI message using a J2.0 message in X1 and transmitted over the JREAP-C IP network.

- TCA-CIAV-010968 -> Verify Active and Semi-Active JRE Platforms can TX own PPLI Messages J2.X Point to Point

- TCA-CIAV-011948 -> Verify Active and Semi-Active JRE Platforms can Display own PPLI Messages J2.X

- TCA-CIAV-016556 -> Ground-to-Air Service generate and transmit J2.0 Indirect Interface Precise Participant Location and Identification (PPLI) message to remain active on the Link 16 network

- TCA-CIAV-017472 -> Single Lady - Copy



### SP5-TIN-109 -> JREAP Gateway Consumer

#### SP5-SREQ-622 -> Each JRE Capable MNP shall be able to receive and display J3.x and J7.0 J-Series Messages (In X1 messages), from Link-16 capable MNPs, to the MN

- TCA-CIAV-011941 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN - Using mandatory SP5 Standards

- TCA-CIAV-011951 -> Verify Active JRE Platforms can transmit or forward Drop Track Messages (J7.0) to the Mission Network

- TCA-CIAV-011953 -> [End -to End ] Verify FJUG Active Platforms can generate or forward J-Messages from the L16 network and L16 Display systems can display them

- TCA-CIAV-011954 -> Verify Hub JRE Platforms can forward J-Series messages to all the JRE Platforms connected to the Hub

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

- TCA-CIAV-011958 -> Verify Active JRE do not transmit or process received messages requiring extrapolation until CTR is completed



### SP5-TIN-109 -> JREAP Gateway Provider

#### SP5-SREQ-399 -> The gateways between TDL and IP based networks shall exchange the relevant TDL messages between the TDL network and a common IP based (mission) network.

- TCA-CIAV-011941 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN - Using mandatory SP5 Standards

- TCA-CIAV-011951 -> Verify Active JRE Platforms can transmit or forward Drop Track Messages (J7.0) to the Mission Network

- TCA-CIAV-011952 -> Verify Active JRE Platforms connected to L16 network (FJUG)  can convert a J2.X Direct PPLI to J2.0 Indirect PPLI and forward to the network via Hub

- TCA-CIAV-011953 -> [End -to End ] Verify FJUG Active Platforms can generate or forward J-Messages from the L16 network and L16 Display systems can display them

- TCA-CIAV-011954 -> Verify Hub JRE Platforms can forward J-Series messages to all the JRE Platforms connected to the Hub

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

- TCA-CIAV-011958 -> Verify Active JRE do not transmit or process received messages requiring extrapolation until CTR is completed

#### SP5-SREQ-675 -> MNP NTP - Federated MNPs DL services shall be synchronized with a difference less than the one indicated by the DL SMA

- TCA-CIAV-011957 -> Verify JRE Processors can connect using UTC/RTT as Common Time Reference

#### SP5-SREQ-678 -> MNP JRE Perform JRE Role - Each JRE capable MNP shall be able to perform at least one of the following JRE roles: FJUG, JRE JU, JREU

- TCA-CIAV-011945 -> Verify FJUG (Active Forwarder) nodes have configured the systems according to OPTASKLINK / JMEI.

- TCA-CIAV-011951 -> Verify Active JRE Platforms can transmit or forward Drop Track Messages (J7.0) to the Mission Network

- TCA-CIAV-011952 -> Verify Active JRE Platforms connected to L16 network (FJUG)  can convert a J2.X Direct PPLI to J2.0 Indirect PPLI and forward to the network via Hub

- TCA-CIAV-011953 -> [End -to End ] Verify FJUG Active Platforms can generate or forward J-Messages from the L16 network and L16 Display systems can display them

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

- TCA-CIAV-011958 -> Verify Active JRE do not transmit or process received messages requiring extrapolation until CTR is completed



### SP5-TIN-110 -> JREAP Point to Point Collaborator

#### SP5-SREQ-108 -> Connectivity to the JREAP hub shall be limited by JREAP node IDs included on the OPTASKLINK

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

#### SP5-SREQ-109 -> JREAP nodes must log all events, registering at least: originating node ID; IP address; errors; and user access.

- TCA-CIAV-011937 -> Verify JREU nodes log the following events; user access (logon and logoff)

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

#### SP5-SREQ-110 -> Communication between JREAP nodes shall be secured via accredited crypto devices and keys to the same level as the Link 16 network.

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-011960 -> Verify IP connectivity among partners JRE Processors - Comm Check

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

#### SP5-SREQ-1271 -> A Common Time Reference (CTR) negotiation process must be present to coordinate a common time reference among JREAP nodes. The preferred mechanism will be Coordinated Universal Time (UTC), but Round Trip Time (RTT) will be also supported.

- TCA-CIAV-011957 -> Verify JRE Processors can connect using UTC/RTT as Common Time Reference

#### SP5-SREQ-671 -> MNP JRE Process PPLI - Each JRE Capable MNP shall be able to process and extrapolate PPLI messages (J2.0 in X1)

- TCA-CIAV-011950 -> Verify Active and Semi-Active JRE Platforms can TX own PPLI Messages J2.X via Hub

#### SP5-SREQ-672 -> MNP JRE Active platforms - shall be able to transform all J2.x messages into J2.0 and send it to Link-16 capable MNPs, on the MN (as a X1 Message)

- TCA-CIAV-011952 -> Verify Active JRE Platforms connected to L16 network (FJUG)  can convert a J2.X Direct PPLI to J2.0 Indirect PPLI and forward to the network via Hub

#### SP5-SREQ-673 -> MNP JRE  Terminate Link - All platforms shall be able to terminate a JREAP link.

- TCA-CIAV-011938 -> Verify JRE Hub platforms connected to a JRE Platforms can exit the JREAP Network and Terminate the links (X0.9)

#### SP5-SREQ-675 -> MNP NTP - Federated MNPs DL services shall be synchronized with a difference less than the one indicated by the DL SMA

- TCA-CIAV-011957 -> Verify JRE Processors can connect using UTC/RTT as Common Time Reference

#### SP5-SREQ-678 -> MNP JRE Perform JRE Role - Each JRE capable MNP shall be able to perform at least one of the following JRE roles: FJUG, JRE JU, JREU

- TCA-CIAV-011944 -> Verify JREU (Hub) nodes have configured the systems according to OPTASKLINK / JMEI.

- TCA-CIAV-011959 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Data Looping)

- TCA-CIAV-016734 -> Verify JRE Processors have Intrusion detection mechanism when it receives data with its IU number (Intrusion)

#### SP5-SREQ-682 -> JRE platforms must comply with ATDLP-5-18(B) extrapolation rules.

- TCA-CIAV-011940 -> Data Link Compliance with SP5 Standards

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

#### SP5-SREQ-685 -> MNP JRE Processors that are configured in active or semi-active mode are required to generate their own PPLI message using a J2.0 message in X1 and transmitted over the JREAP-C IP network.

- TCA-CIAV-011950 -> Verify Active and Semi-Active JRE Platforms can TX own PPLI Messages J2.X via Hub



### SP5-TIN-110 -> JREAP Hub Mediator

#### SP5-SREQ-253 -> MNP JRE Hub Role - JRE Hub Platforms shall be able to forward X1 messages from different JRE Platforms

- TCA-CIAV-011938 -> Verify JRE Hub platforms connected to a JRE Platforms can exit the JREAP Network and Terminate the links (X0.9)

- TCA-CIAV-011951 -> Verify Active JRE Platforms can transmit or forward Drop Track Messages (J7.0) to the Mission Network

- TCA-CIAV-011952 -> Verify Active JRE Platforms connected to L16 network (FJUG)  can convert a J2.X Direct PPLI to J2.0 Indirect PPLI and forward to the network via Hub

- TCA-CIAV-011953 -> [End -to End ] Verify FJUG Active Platforms can generate or forward J-Messages from the L16 network and L16 Display systems can display them

- TCA-CIAV-011954 -> Verify Hub JRE Platforms can forward J-Series messages to all the JRE Platforms connected to the Hub

- TCA-CIAV-011955 -> Verify Active JRE Platforms can transmit or forward L16 Surveillance J3.X Messages to the MN via Hub

#### SP5-SREQ-624 -> MNP JRE FJUG - Each FJUG Capable MNP  shall be able to forward PPLI messages as Indirect PPLI between Link-16 and the MN

- TCA-CIAV-011950 -> Verify Active and Semi-Active JRE Platforms can TX own PPLI Messages J2.X via Hub

- TCA-CIAV-011952 -> Verify Active JRE Platforms connected to L16 network (FJUG)  can convert a J2.X Direct PPLI to J2.0 Indirect PPLI and forward to the network via Hub



## SP5-SI-LANDC2T -> Land Tactical C2 Information Exchange

### SP5-TIN-196 -> JDSS Message Exchange Consumer

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

#### SP5-SREQ-332 -> The Service shall enable the exchange of a selection of Control Feature Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016596 -> 4560: REPO-04584-*Overlay: Exchange Control Features

- TCA-CIAV-017065 -> Battlespace Geometry Dissemination - JDSS

#### SP5-SREQ-333 -> The Service shall enable the exchange of Vehicles and Weapons Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016593 -> 4520: REPO-04587-Overlay: Exchange Vehicle, Weapon, Person

#### SP5-SREQ-334 -> The Service shall enable the exchange of Improvised Explosive Device (IED) Battlespace Objects and Unexploded Ordnance Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016605 -> 4330: REPO-04564-*Contact Sighting: Exchange IED, Mined Area

#### SP5-SREQ-335 -> The Service shall enable the exchange of a selection of Task Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

#### SP5-SREQ-336 -> The Service shall enable the exchange of a selection of Event Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016595 -> 4550: REPO-04585-*Overlay: Exchange Events

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

- TCA-CIAV-016600 -> 4580: REPO-04579-* Overlay: Exchange NBC objects/events

- TCA-CIAV-016602 -> 4350: REPO-04576-*Contact Sighting: Exchange Events

#### SP5-SREQ-337 -> The Service shall enable the exchange of Person Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016593 -> 4520: REPO-04587-Overlay: Exchange Vehicle, Weapon, Person

- TCA-CIAV-016611 -> 4320: REPO-02957-*Contact Sighting: Exchange Vehicle, Weapon, Person

#### SP5-SREQ-338 -> The Service shall enable the exchange of a selection of Facility Battlespace Objects and Geographic Feature Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016594 -> 4540: REPO-04586-*Overlay: Exchange Roadblock, Foxhole, Building

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

#### SP5-SREQ-339 -> The Service shall enable the exchange of Organization/Unit Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

- TCA-CIAV-016614 -> 4590: REPO-02689-Overlay: Exchange the Unit Symbols from the MOR Symbols

#### SP5-SREQ-340 -> The Service shall enable the exchange of Task Organization information.

- TCA-CIAV-016599 -> 4570: REPO-04580-* Overlay: Exchange Tasks

#### SP5-SREQ-341 -> The Service shall enable the exchange of new Battlespace Objects, the update to existing Battlespace Objects and the deletion of Battlespace Objects.

- TCA-CIAV-016594 -> 4540: REPO-04586-*Overlay: Exchange Roadblock, Foxhole, Building

- TCA-CIAV-016595 -> 4550: REPO-04585-*Overlay: Exchange Events

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

- TCA-CIAV-016600 -> 4580: REPO-04579-* Overlay: Exchange NBC objects/events

- TCA-CIAV-017065 -> Battlespace Geometry Dissemination - JDSS

#### SP5-SREQ-342 -> The Service shall enable the exchange of Operational Comments on Battlespace Objects.

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

#### SP5-SREQ-343 -> The Service shall enable the exchange of Sketches consisting of generic objects with point, line and area geometry.

- TCA-CIAV-016601 -> 4410: REPO-04578-Sketches: Exchange Point, Line and Area sketch

#### SP5-SREQ-344 -> The Service shall enable the exchange of Overlays (groupings of Battlespace Objects) in support of Situational Awareness.

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

- TCA-CIAV-016599 -> 4570: REPO-04580-* Overlay: Exchange Tasks

- TCA-CIAV-016606 -> 4505: REPO-02968-Overlay: Message Synchronization

- TCA-CIAV-017065 -> Battlespace Geometry Dissemination - JDSS

#### SP5-SREQ-345 -> The Service shall enable the exchange of Presence and Identification Information (Blue Force Tracking).

- TCA-CIAV-016613 -> 4210: REPO-02951-BFT: Exchange Identification and Presence Messages 

- TCA-CIAV-016900 -> NEW(TT-00902): BFT: Exchange Identification and Presence Messages (additional info required)

#### SP5-SREQ-346 -> The Service shall have the ability to configure the exchange interval of BFT information to tailor the update frequency to the available bandwidth.

- TCA-CIAV-016612 -> 4205: REPO-02952-BFT: Message Synchronization

#### SP5-SREQ-347 -> The Service shall enable the exchange of Contact Sighting to report observed enemies.

- TCA-CIAV-016602 -> 4350: REPO-04576-*Contact Sighting: Exchange Events

- TCA-CIAV-016603 -> 4340: REPO-04575-*Contact Sighting: Exchange Roadblock, Foxhole, Building

- TCA-CIAV-016607 -> 4310: REPO-02967-*Contact Sighting: Exchange Unit

- TCA-CIAV-016610 -> 4305: REPO-02962-Contact Sighting: Message Synchronization

- TCA-CIAV-016611 -> 4320: REPO-02957-*Contact Sighting: Exchange Vehicle, Weapon, Person

#### SP5-SREQ-348 -> The Service shall enable the exchange of Generic Text messages not linked to any Battlespace Object.

- TCA-CIAV-016592 -> 4621: REPO-05485-Geninfo: Exchange Message (with ReplyTo, ReceivedNotification and ReadNotification)

- TCA-CIAV-016608 -> 4604: REPO-02964-Geninfo: Message Synchronization

- TCA-CIAV-016609 -> 4620: REPO-02963-Geninfo: Exchange Message

- TCA-CIAV-017302 -> Land Tactical Chat Message

#### SP5-SREQ-349 -> The Service shall enable the exchange of Casual Information Request messages (MedEvac in free text format).

- TCA-CIAV-016604 -> 4710: REPO-04565-MEDEVAC: Exchange Casualty Evacuation Request

#### SP5-SREQ-353 -> The Service shall enable the initial synchronization of the Consumer with the Provider’s existing information.

- TCA-CIAV-016610 -> 4305: REPO-02962-Contact Sighting: Message Synchronization

- TCA-CIAV-016612 -> 4205: REPO-02952-BFT: Message Synchronization

#### SP5-SREQ-354 -> The Service shall support the re-synchronization of a Consumer with the Provider’s existing information after a period of disconnection.

- TCA-CIAV-016606 -> 4505: REPO-02968-Overlay: Message Synchronization

- TCA-CIAV-016612 -> 4205: REPO-02952-BFT: Message Synchronization

#### SP5-SREQ-355 -> The Service shall support the unilateral recovery of the service after a reset; both in its role as Provider and as Consumer; after the reset the service shall be able to resume providing and receiving data and be synchronized with its C2 System without resulting in duplicate information.



### SP5-TIN-196 -> JDSS Message Exchange Provider

#### SP5-SREQ-23 -> C2 Information exchanged between mobile land tactical units (TACCIS) via coalition waveforms shall not require protection that is more stringent than what would be required for NATO RESTRICTED information.

#### SP5-SREQ-332 -> The Service shall enable the exchange of a selection of Control Feature Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016596 -> 4560: REPO-04584-*Overlay: Exchange Control Features

- TCA-CIAV-017065 -> Battlespace Geometry Dissemination - JDSS

#### SP5-SREQ-333 -> The Service shall enable the exchange of Vehicles and Weapons Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016593 -> 4520: REPO-04587-Overlay: Exchange Vehicle, Weapon, Person

#### SP5-SREQ-334 -> The Service shall enable the exchange of Improvised Explosive Device (IED) Battlespace Objects and Unexploded Ordnance Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016605 -> 4330: REPO-04564-*Contact Sighting: Exchange IED, Mined Area

#### SP5-SREQ-335 -> The Service shall enable the exchange of a selection of Task Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

#### SP5-SREQ-336 -> The Service shall enable the exchange of a selection of Event Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016595 -> 4550: REPO-04585-*Overlay: Exchange Events

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

- TCA-CIAV-016600 -> 4580: REPO-04579-* Overlay: Exchange NBC objects/events

- TCA-CIAV-016602 -> 4350: REPO-04576-*Contact Sighting: Exchange Events

#### SP5-SREQ-337 -> The Service shall enable the exchange of Person Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016593 -> 4520: REPO-04587-Overlay: Exchange Vehicle, Weapon, Person

- TCA-CIAV-016611 -> 4320: REPO-02957-*Contact Sighting: Exchange Vehicle, Weapon, Person

#### SP5-SREQ-338 -> The Service shall enable the exchange of a selection of Facility Battlespace Objects and Geographic Feature Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016594 -> 4540: REPO-04586-*Overlay: Exchange Roadblock, Foxhole, Building

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

#### SP5-SREQ-339 -> The Service shall enable the exchange of Organization/Unit Battlespace Objects (including the specification of attributes).

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

- TCA-CIAV-016614 -> 4590: REPO-02689-Overlay: Exchange the Unit Symbols from the MOR Symbols

#### SP5-SREQ-340 -> The Service shall enable the exchange of Task Organization information.

- TCA-CIAV-016599 -> 4570: REPO-04580-* Overlay: Exchange Tasks

#### SP5-SREQ-341 -> The Service shall enable the exchange of new Battlespace Objects, the update to existing Battlespace Objects and the deletion of Battlespace Objects.

- TCA-CIAV-016594 -> 4540: REPO-04586-*Overlay: Exchange Roadblock, Foxhole, Building

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

- TCA-CIAV-016600 -> 4580: REPO-04579-* Overlay: Exchange NBC objects/events

- TCA-CIAV-017065 -> Battlespace Geometry Dissemination - JDSS

#### SP5-SREQ-342 -> The Service shall enable the exchange of Operational Comments on Battlespace Objects.

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

#### SP5-SREQ-343 -> The Service shall enable the exchange of Sketches consisting of generic objects with point, line and area geometry.

- TCA-CIAV-016601 -> 4410: REPO-04578-Sketches: Exchange Point, Line and Area sketch

#### SP5-SREQ-344 -> The Service shall enable the exchange of Overlays (groupings of Battlespace Objects) in support of Situational Awareness.

- TCA-CIAV-016595 -> 4550: REPO-04585-*Overlay: Exchange Events

- TCA-CIAV-016597 -> 4530: REPO-04583-*Overlay: Exchange Bombing and Mined Area

- TCA-CIAV-016598 -> 4510: REPO-04582-*Overlay: Exchange Unit

- TCA-CIAV-016599 -> 4570: REPO-04580-* Overlay: Exchange Tasks

- TCA-CIAV-016606 -> 4505: REPO-02968-Overlay: Message Synchronization

- TCA-CIAV-017065 -> Battlespace Geometry Dissemination - JDSS

#### SP5-SREQ-345 -> The Service shall enable the exchange of Presence and Identification Information (Blue Force Tracking).

- TCA-CIAV-016613 -> 4210: REPO-02951-BFT: Exchange Identification and Presence Messages 

- TCA-CIAV-016900 -> NEW(TT-00902): BFT: Exchange Identification and Presence Messages (additional info required)

#### SP5-SREQ-346 -> The Service shall have the ability to configure the exchange interval of BFT information to tailor the update frequency to the available bandwidth.

- TCA-CIAV-016612 -> 4205: REPO-02952-BFT: Message Synchronization

#### SP5-SREQ-347 -> The Service shall enable the exchange of Contact Sighting to report observed enemies.

- TCA-CIAV-016602 -> 4350: REPO-04576-*Contact Sighting: Exchange Events

- TCA-CIAV-016603 -> 4340: REPO-04575-*Contact Sighting: Exchange Roadblock, Foxhole, Building

- TCA-CIAV-016607 -> 4310: REPO-02967-*Contact Sighting: Exchange Unit

- TCA-CIAV-016610 -> 4305: REPO-02962-Contact Sighting: Message Synchronization

- TCA-CIAV-016611 -> 4320: REPO-02957-*Contact Sighting: Exchange Vehicle, Weapon, Person

#### SP5-SREQ-348 -> The Service shall enable the exchange of Generic Text messages not linked to any Battlespace Object.

- TCA-CIAV-016592 -> 4621: REPO-05485-Geninfo: Exchange Message (with ReplyTo, ReceivedNotification and ReadNotification)

- TCA-CIAV-016608 -> 4604: REPO-02964-Geninfo: Message Synchronization

- TCA-CIAV-016609 -> 4620: REPO-02963-Geninfo: Exchange Message

- TCA-CIAV-017302 -> Land Tactical Chat Message

#### SP5-SREQ-349 -> The Service shall enable the exchange of Casual Information Request messages (MedEvac in free text format).

- TCA-CIAV-016604 -> 4710: REPO-04565-MEDEVAC: Exchange Casualty Evacuation Request

#### SP5-SREQ-353 -> The Service shall enable the initial synchronization of the Consumer with the Provider’s existing information.

- TCA-CIAV-016610 -> 4305: REPO-02962-Contact Sighting: Message Synchronization

- TCA-CIAV-016612 -> 4205: REPO-02952-BFT: Message Synchronization

#### SP5-SREQ-354 -> The Service shall support the re-synchronization of a Consumer with the Provider’s existing information after a period of disconnection.

- TCA-CIAV-016606 -> 4505: REPO-02968-Overlay: Message Synchronization

- TCA-CIAV-016612 -> 4205: REPO-02952-BFT: Message Synchronization

#### SP5-SREQ-355 -> The Service shall support the unilateral recovery of the service after a reset; both in its role as Provider and as Consumer; after the reset the service shall be able to resume providing and receiving data and be synchronized with its C2 System without resulting in duplicate information.



## SP5-SI-LC2IE -> Land C2 Information Exchange

### SP5-TIN-357 -> Exchange Recognized Ground Picture Consumer

#### SP5-SREQ-1153 -> MIP4 Providers and MIP4 Consumers shall be able to exchange data objects at the lowest version of MIP4-IES supported by both, with a minimum of 4.4

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-259 -> The LC2IE Service shall enable the exchange of Consumable Objects (including specification of detailed attributes).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-480 -> The LC2IE Service shall enable the exchange of Overlays (groupings of BattleSpace Objects) in support of Situational Awareness.

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

- TCA-CIAV-017289 -> Forwarding Land Battlespace Object exchange - MIP

#### SP5-SREQ-484 -> The LC2IE Service shall enable the exchange of Operational Comments on an exchanged BattleSpace Object.

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

#### SP5-SREQ-558 -> The LC2IE Service shall enable the exchange of Control Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-559 -> The LC2IE Service shall enable the exchange of Facility BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-560 -> The LC2IE Service shall enable the exchange of Equipment BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-561 -> The LC2IE Service shall enable the exchange of Unexploded Ordnance BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-562 -> The LC2IE Service shall enable the exchange of Task BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-563 -> The LC2IE Service shall enable the exchange of Event BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-564 -> The LC2IE Service shall enable the exchange of Person BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-565 -> The LC2IE Service shall enable the exchange of Geographic Feature BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-566 -> The LC2IE Service shall enable the exchange of Meteorological Feature BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.



### SP5-TIN-357 -> Forward received MIP 4 data objects Mediator

#### SP5-SREQ-1154 -> MIP4 Providers shall support forwarding of received data-objects to MIP4 Consumers without altering the contents.

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

- TCA-CIAV-017289 -> Forwarding Land Battlespace Object exchange - MIP



### SP5-TIN-357 -> Exchange Recognized Ground Picture Provider

#### SP5-SREQ-1153 -> MIP4 Providers and MIP4 Consumers shall be able to exchange data objects at the lowest version of MIP4-IES supported by both, with a minimum of 4.4

#### SP5-SREQ-259 -> The LC2IE Service shall enable the exchange of Consumable Objects (including specification of detailed attributes).

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-480 -> The LC2IE Service shall enable the exchange of Overlays (groupings of BattleSpace Objects) in support of Situational Awareness.

#### SP5-SREQ-481 -> The LC2IE Service shall support periods of continuous operation.

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017126 -> 4920: REPO-04730-Forwarding data (Initiator->Forwarder->Target)

- TCA-CIAV-017289 -> Forwarding Land Battlespace Object exchange - MIP

#### SP5-SREQ-484 -> The LC2IE Service shall enable the exchange of Operational Comments on an exchanged BattleSpace Object.

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

#### SP5-SREQ-558 -> The LC2IE Service shall enable the exchange of Control Feature BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-559 -> The LC2IE Service shall enable the exchange of Facility BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-560 -> The LC2IE Service shall enable the exchange of Equipment BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-561 -> The LC2IE Service shall enable the exchange of Unexploded Ordnance BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-562 -> The LC2IE Service shall enable the exchange of Task BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-563 -> The LC2IE Service shall enable the exchange of Event BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-564 -> The LC2IE Service shall enable the exchange of Person BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-565 -> The LC2IE Service shall enable the exchange of Geographic Feature BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-566 -> The LC2IE Service shall enable the exchange of Meteorological Feature BattleSpace Objects (including specification of detailed attributes).

#### SP5-SREQ-575 -> The LC2IE Service shall support the exchange of frequent transactions.

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.



### SP5-TIN-44 -> Exchange Non Friendly ORBAT Consumer

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

#### SP5-SREQ-317 -> The LC2IE Service shall enable the exchange of Non-Friendly Order-of-Battle (ORBAT) information.

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

- TCA-CIAV-017114 -> 4006: REPO-05593-Offline Orbat / TaskOrg Exchange

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.



### SP5-TIN-44 -> Exchange Non Friendly ORBAT Provider

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

#### SP5-SREQ-317 -> The LC2IE Service shall enable the exchange of Non-Friendly Order-of-Battle (ORBAT) information.

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-481 -> The LC2IE Service shall support periods of continuous operation.

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017115 -> 4700: REPO-00242-Exchanging Enemy Order of Battle

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

- TCA-CIAV-017114 -> 4006: REPO-05593-Offline Orbat / TaskOrg Exchange

#### SP5-SREQ-575 -> The LC2IE Service shall support the exchange of frequent transactions.

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.



### SP5-TIN-45 -> Exchange Friendly Land ORBAT and TaskOrg Consumer

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

- TCA-CIAV-017114 -> 4006: REPO-05593-Offline Orbat / TaskOrg Exchange

#### SP5-SREQ-571 -> The LC2IE Service shall enable the exchange of Friendly Order-of-Battle (ORBAT) information.

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

#### SP5-SREQ-573 -> The LC2IE Service shall enable the exchange of Task Organisation information.

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.



### SP5-TIN-45 -> Exchange Friendly Land ORBAT and TaskOrg Provider

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-481 -> The LC2IE Service shall support periods of continuous operation.

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

- TCA-CIAV-017114 -> 4006: REPO-05593-Offline Orbat / TaskOrg Exchange

#### SP5-SREQ-571 -> The LC2IE Service shall enable the exchange of Friendly Order-of-Battle (ORBAT) information.

- TCA-CIAV-017123 -> 4750: REPO-00361-Exchanging Friendly Order of Battle

#### SP5-SREQ-573 -> The LC2IE Service shall enable the exchange of Task Organisation information.

- TCA-CIAV-017141 -> 4760: REPO-02945-Exchanging Task Organisation

#### SP5-SREQ-575 -> The LC2IE Service shall support the exchange of frequent transactions.

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.



### SP5-TIN-46 -> Exchange Land Generic Overlay Consumer

#### SP5-SREQ-259 -> The LC2IE Service shall enable the exchange of Consumable Objects (including specification of detailed attributes).

- TCA-CIAV-017109 -> 4320: REPO-00198-Exchanging Consumable Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

- TCA-CIAV-017144 -> 2200: REPO-05590-Handling of modified-since too far in the past or in the future

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017127 -> 4230: REPO-00390-Exchanging Convoys

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-480 -> The LC2IE Service shall enable the exchange of Overlays (groupings of BattleSpace Objects) in support of Situational Awareness.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017105 -> 4953: REPO-05586-Request Overlays - implicit delete

- TCA-CIAV-017107 -> 4954: REPO-05583-Request a single Overlay by ID

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017112 -> 4952: REPO-05587-Request Modified List of Overlays

- TCA-CIAV-017117 -> 4951: REPO-05579-Request List of Overlays

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017134 -> 4961: REPO-05588-Request Overlay Contents - implicit delete

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-484 -> The LC2IE Service shall enable the exchange of Operational Comments on an exchanged BattleSpace Object.

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017134 -> 4961: REPO-05588-Request Overlay Contents - implicit delete

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

- TCA-CIAV-017140 -> 4005: REPO-00581-Offline Overlay Exchange

#### SP5-SREQ-558 -> The LC2IE Service shall enable the exchange of Control Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

#### SP5-SREQ-559 -> The LC2IE Service shall enable the exchange of Facility BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

#### SP5-SREQ-560 -> The LC2IE Service shall enable the exchange of Equipment BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017116 -> 4330: REPO-00266-Exchanging Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017122 -> 4334: REPO-00349-Exchanging Aircraft Equipment

- TCA-CIAV-017136 -> 4332: REPO-00557-Exchanging Vehicle Equipment

- TCA-CIAV-017142 -> 4336: REPO-00617-Exchanging Maritime Equipment

#### SP5-SREQ-561 -> The LC2IE Service shall enable the exchange of Unexploded Ordnance BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017101 -> 4291: REPO-00040-Exchanging UXO

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-562 -> The LC2IE Service shall enable the exchange of Task BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

#### SP5-SREQ-563 -> The LC2IE Service shall enable the exchange of Event BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

#### SP5-SREQ-564 -> The LC2IE Service shall enable the exchange of Person BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-565 -> The LC2IE Service shall enable the exchange of Geographic Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-566 -> The LC2IE Service shall enable the exchange of Meteorological Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

- TCA-CIAV-017131 -> 4910: REPO-00482-Updating the Managed List

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.

- TCA-CIAV-017104 -> 4995: REPO-03391-Verify Logging



### SP5-TIN-46 -> Exchange Land Generic Overlay Provider

#### SP5-SREQ-259 -> The LC2IE Service shall enable the exchange of Consumable Objects (including specification of detailed attributes).

- TCA-CIAV-017109 -> 4320: REPO-00198-Exchanging Consumable Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017127 -> 4230: REPO-00390-Exchanging Convoys

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-480 -> The LC2IE Service shall enable the exchange of Overlays (groupings of BattleSpace Objects) in support of Situational Awareness.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017105 -> 4953: REPO-05586-Request Overlays - implicit delete

- TCA-CIAV-017107 -> 4954: REPO-05583-Request a single Overlay by ID

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017112 -> 4952: REPO-05587-Request Modified List of Overlays

- TCA-CIAV-017117 -> 4951: REPO-05579-Request List of Overlays

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017134 -> 4961: REPO-05588-Request Overlay Contents - implicit delete

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-481 -> The LC2IE Service shall support periods of continuous operation.

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-484 -> The LC2IE Service shall enable the exchange of Operational Comments on an exchanged BattleSpace Object.

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017134 -> 4961: REPO-05588-Request Overlay Contents - implicit delete

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017491 -> Situation Awareness Overlay exchange - MIP

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

- TCA-CIAV-017140 -> 4005: REPO-00581-Offline Overlay Exchange

#### SP5-SREQ-558 -> The LC2IE Service shall enable the exchange of Control Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

#### SP5-SREQ-559 -> The LC2IE Service shall enable the exchange of Facility BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

#### SP5-SREQ-560 -> The LC2IE Service shall enable the exchange of Equipment BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017116 -> 4330: REPO-00266-Exchanging Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017122 -> 4334: REPO-00349-Exchanging Aircraft Equipment

- TCA-CIAV-017136 -> 4332: REPO-00557-Exchanging Vehicle Equipment

- TCA-CIAV-017142 -> 4336: REPO-00617-Exchanging Maritime Equipment

#### SP5-SREQ-561 -> The LC2IE Service shall enable the exchange of Unexploded Ordnance BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017101 -> 4291: REPO-00040-Exchanging UXO

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-562 -> The LC2IE Service shall enable the exchange of Task BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

#### SP5-SREQ-563 -> The LC2IE Service shall enable the exchange of Event BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

#### SP5-SREQ-564 -> The LC2IE Service shall enable the exchange of Person BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-565 -> The LC2IE Service shall enable the exchange of Geographic Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-566 -> The LC2IE Service shall enable the exchange of Meteorological Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-570 -> The LC2IE Service shall enable the exchange of Planned Overlays

#### SP5-SREQ-575 -> The LC2IE Service shall support the exchange of frequent transactions.

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

- TCA-CIAV-017131 -> 4910: REPO-00482-Updating the Managed List

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.

- TCA-CIAV-017104 -> 4995: REPO-03391-Verify Logging



### SP5-TIN-73 -> Exchange Recognized Ground Picture Consumer

#### SP5-SREQ-1153 -> MIP4 Providers and MIP4 Consumers shall be able to exchange data objects at the lowest version of MIP4-IES supported by both, with a minimum of 4.4

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

#### SP5-SREQ-259 -> The LC2IE Service shall enable the exchange of Consumable Objects (including specification of detailed attributes).

- TCA-CIAV-017109 -> 4320: REPO-00198-Exchanging Consumable Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

- TCA-CIAV-017137 -> 4990: REPO-00561-Handling Reset

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

- TCA-CIAV-017144 -> 2200: REPO-05590-Handling of modified-since too far in the past or in the future

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017127 -> 4230: REPO-00390-Exchanging Convoys

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

- TCA-CIAV-017143 -> 2100: REPO-00053-MNP Configures LC2IE Service

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-480 -> The LC2IE Service shall enable the exchange of Overlays (groupings of BattleSpace Objects) in support of Situational Awareness.

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017105 -> 4953: REPO-05586-Request Overlays - implicit delete

- TCA-CIAV-017107 -> 4954: REPO-05583-Request a single Overlay by ID

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017112 -> 4952: REPO-05587-Request Modified List of Overlays

- TCA-CIAV-017117 -> 4951: REPO-05579-Request List of Overlays

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-484 -> The LC2IE Service shall enable the exchange of Operational Comments on an exchanged BattleSpace Object.

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017134 -> 4961: REPO-05588-Request Overlay Contents - implicit delete

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

#### SP5-SREQ-558 -> The LC2IE Service shall enable the exchange of Control Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

#### SP5-SREQ-559 -> The LC2IE Service shall enable the exchange of Facility BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

#### SP5-SREQ-560 -> The LC2IE Service shall enable the exchange of Equipment BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017116 -> 4330: REPO-00266-Exchanging Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017122 -> 4334: REPO-00349-Exchanging Aircraft Equipment

- TCA-CIAV-017136 -> 4332: REPO-00557-Exchanging Vehicle Equipment

- TCA-CIAV-017142 -> 4336: REPO-00617-Exchanging Maritime Equipment

#### SP5-SREQ-561 -> The LC2IE Service shall enable the exchange of Unexploded Ordnance BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017101 -> 4291: REPO-00040-Exchanging UXO

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-562 -> The LC2IE Service shall enable the exchange of Task BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

#### SP5-SREQ-563 -> The LC2IE Service shall enable the exchange of Event BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

#### SP5-SREQ-564 -> The LC2IE Service shall enable the exchange of Person BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-565 -> The LC2IE Service shall enable the exchange of Geographic Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-566 -> The LC2IE Service shall enable the exchange of Meteorological Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

- TCA-CIAV-017131 -> 4910: REPO-00482-Updating the Managed List

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

- TCA-CIAV-017110 -> 4980: REPO-03427-Additional information on a BSO created by another nation

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.

- TCA-CIAV-017104 -> 4995: REPO-03391-Verify Logging



### SP5-TIN-73 -> Exchange Recognized Ground Picture Provider

#### SP5-SREQ-1153 -> MIP4 Providers and MIP4 Consumers shall be able to exchange data objects at the lowest version of MIP4-IES supported by both, with a minimum of 4.4

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

#### SP5-SREQ-259 -> The LC2IE Service shall enable the exchange of Consumable Objects (including specification of detailed attributes).

- TCA-CIAV-017109 -> 4320: REPO-00198-Exchanging Consumable Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-264 -> The LC2IE Service shall support the unilateral recovery of the service after a restart/re-initialisation/re-deployment; both in its role as 
Provider and as Consumer; afterwards the service shall be able to resume providing and receiving data and be synchronized with its C2 System.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017137 -> 4990: REPO-00561-Handling Reset

#### SP5-SREQ-351 -> The LC2IE Service shall enable the initial synchronization of a Consumer with the Provider’s existing information.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-352 -> The LC2IE Service shall enable the exchange of updated information about an existing BattleSpace Object.

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-395 -> The LC2IE Service shall support the graceful handling of information exchange errors.

#### SP5-SREQ-470 -> The LC2IE Service shall enable the exchange of Organisation/Unit BattleSpace Objects (including specification of detailed attributes such as hostility).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017127 -> 4230: REPO-00390-Exchanging Convoys

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-472 -> The LC2IE Service shall support the initialisation of a system upon joining the Mission Network.

#### SP5-SREQ-476 -> The LC2IE Service shall support the exchange of large volumes of data during (initial) synchronization.

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

#### SP5-SREQ-477 -> The LC2IE Service shall enable the exchange of information grouped by Topic.

#### SP5-SREQ-480 -> The LC2IE Service shall enable the exchange of Overlays (groupings of BattleSpace Objects) in support of Situational Awareness.

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017105 -> 4953: REPO-05586-Request Overlays - implicit delete

- TCA-CIAV-017107 -> 4954: REPO-05583-Request a single Overlay by ID

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017112 -> 4952: REPO-05587-Request Modified List of Overlays

- TCA-CIAV-017117 -> 4951: REPO-05579-Request List of Overlays

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-481 -> The LC2IE Service shall support periods of continuous operation.

#### SP5-SREQ-483 -> The LC2IE Service shall enable the exchange of a new BattleSpace Object (i.e. not previously exchanged via this service).

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017102 -> 4964: REPO-05589-Request a single BSO from an Overlay by ID

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-484 -> The LC2IE Service shall enable the exchange of Operational Comments on an exchanged BattleSpace Object.

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

#### SP5-SREQ-555 -> The LC2IE Service shall enable the Provider to communicate the deletion of a previously exchanged BattleSpace Object.

- TCA-CIAV-017067 -> Event Battlespace Geometry - MIP

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017120 -> 4200: REPO-00341-Exchanging Organisations

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

- TCA-CIAV-017125 -> 4940: REPO-02932-Exchanging Large Quantities of Objects

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

- TCA-CIAV-017133 -> 4966: REPO-05584-Poll Overlay Content

- TCA-CIAV-017134 -> 4961: REPO-05588-Request Overlay Contents - implicit delete

- TCA-CIAV-017135 -> 4450: REPO-00538-Exchanging Network Services

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

- TCA-CIAV-017139 -> 4210: REPO-00568-Exchanging Units

- TCA-CIAV-017277 -> Land Battlespace Object exchange - MIP

#### SP5-SREQ-557 -> The LC2IE Service shall enable the offline exchange of Information between Provider and Consumer systems.

- TCA-CIAV-017140 -> 4005: REPO-00581-Offline Overlay Exchange

#### SP5-SREQ-558 -> The LC2IE Service shall enable the exchange of Control Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017130 -> 4600: REPO-00464-Exchanging Control Features

- TCA-CIAV-017138 -> 4610: REPO-00566-Exchanging Control Feature Routes

#### SP5-SREQ-559 -> The LC2IE Service shall enable the exchange of Facility BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017108 -> 4420: REPO-00176-Exchanging Air Facilities

- TCA-CIAV-017111 -> 4410: REPO-00200-Exchanging Military Facilities

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017119 -> 4400: REPO-00324-Exchanging Facilities

- TCA-CIAV-017121 -> 4430: REPO-00343-Exchanging Medical Facilities

- TCA-CIAV-017132 -> 4440: REPO-00503-Exchanging Maritime Facilities

#### SP5-SREQ-560 -> The LC2IE Service shall enable the exchange of Equipment BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

- TCA-CIAV-017116 -> 4330: REPO-00266-Exchanging Equipment

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017122 -> 4334: REPO-00349-Exchanging Aircraft Equipment

- TCA-CIAV-017136 -> 4332: REPO-00557-Exchanging Vehicle Equipment

- TCA-CIAV-017142 -> 4336: REPO-00617-Exchanging Maritime Equipment

#### SP5-SREQ-561 -> The LC2IE Service shall enable the exchange of Unexploded Ordnance BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017101 -> 4291: REPO-00040-Exchanging UXO

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-562 -> The LC2IE Service shall enable the exchange of Task BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017129 -> 4820: REPO-00456-Exchanging Task Graphics

#### SP5-SREQ-563 -> The LC2IE Service shall enable the exchange of Event BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

- TCA-CIAV-017128 -> 4800: REPO-00446-Exchanging types of  Events

#### SP5-SREQ-564 -> The LC2IE Service shall enable the exchange of Person BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017103 -> 4850: REPO-00134-Exchanging Persons

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-565 -> The LC2IE Service shall enable the exchange of Geographic Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017113 -> 4620: REPO-00209-Exchanging Geographic Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-566 -> The LC2IE Service shall enable the exchange of Meteorological Feature BattleSpace Objects (including specification of detailed attributes).

- TCA-CIAV-017106 -> 4630: REPO-00174-Exchanging Meteorological Features

- TCA-CIAV-017118 -> 4010: REPO-00312-MOR Symbols exchange

#### SP5-SREQ-575 -> The LC2IE Service shall support the exchange of frequent transactions.

- TCA-CIAV-017124 -> 4950: REPO-02933-Frequent Object Updates

#### SP5-SREQ-576 -> The LC2IE Service shall support the re-establishment of information exchange after a period of disconnection.

- TCA-CIAV-017100 -> 4999: REPO-05591-Temporary disconnect from Mission Network

#### SP5-SREQ-7 -> The LC2IE Service shall support the use of Managed Lists to specify details related to e.g., Affiliation.

- TCA-CIAV-017131 -> 4910: REPO-00482-Updating the Managed List

#### SP5-SREQ-8 -> The LC2IE Service shall explicitly link (via common URI) to the BattleSpace Object created by the original Provider when an alternate perspective from a different source has to be expressed.

- TCA-CIAV-017110 -> 4980: REPO-03427-Additional information on a BSO created by another nation

#### SP5-SREQ-88 -> The LC2IE Services must log all events, registering at least: IP addresses and DNS records (sender, receiver); date and time; user connection attempts; and records of successful and unsuccessful data exchange attempts.

- TCA-CIAV-017104 -> 4995: REPO-03391-Verify Logging



## SP5-SI-MAR2C -> Maritime C2 Information Exchange

### SP5-TIN-21 -> OTH-T-Gold Message Exchange Consumer

#### SP5-SREQ-121 -> RMP - Dissemination - All MNPs shall use local remarks (Expanded GOLD message)

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-122 -> RMP- Dissemination - Users unable to process GOLD Messages automatically with a C2 system, but have a Message Handling System, shall use ACP-127 headers.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-125 -> RMP - Contribution - Participants at the lowest level shall contribute to building the Regional RMP by providing maritime information comprising the Military Picture and White Picture (ie merchant shipping).

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-126 -> RMP - Contribution - MNPs shall be able to provide AIS information to the RMP Manager.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-127 -> RMP - Message Reception - Optional Messages shall be considered when required.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-204 -> The Recognized Maritime Picture Services shall be able to filter the transmitted RMP information.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-228 -> RMP - Both RMP Managers and MNPs shall ensure they depart the network correctly.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-94 -> RMP - The Recognized Maritime Picture Manager, both Regional and at the Operational level, shall be able to receive contribution in the form of White Shipping data.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-97 -> Secure log-on shall be enforced for user authentication.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

- TCA-CIAV-016266 -> REPO-04728-RMP System Enforce Secure Login

#### SP5-SREQ-98 -> RMP services shall log specified events

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-99 -> All OTH-T-Gold messages shall conform to standardization detail.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail



### SP5-TIN-21 -> OTH-T-Gold Message Exchange Provider

#### SP5-SREQ-121 -> RMP - Dissemination - All MNPs shall use local remarks (Expanded GOLD message)

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-122 -> RMP- Dissemination - Users unable to process GOLD Messages automatically with a C2 system, but have a Message Handling System, shall use ACP-127 headers.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-125 -> RMP - Contribution - Participants at the lowest level shall contribute to building the Regional RMP by providing maritime information comprising the Military Picture and White Picture (ie merchant shipping).

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-126 -> RMP - Contribution - MNPs shall be able to provide AIS information to the RMP Manager.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-127 -> RMP - Message Reception - Optional Messages shall be considered when required.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-197 -> RMP - The Regional Recognized Maritime Picture Manager shall maintain RMP information for assigned area.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-198 -> RMP - The Recognized Maritime Picture Manager, both Regional and at the Operational level, shall be able to filter received information which contributes to the RMP.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-199 -> RMP - The Recognized Maritime Picture Manager, both Regional and at the Operational level, shall perform validation of received information which contributes to the RMP.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-200 -> The Recognized Maritime Picture Manager, both Regional and at the Operational level, shall perform fusion (merging, correlation, etc.) of information which contributes to the RMP.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-201 -> The Recognized Maritime Picture Manager, both Regional and at the Operational level, shall perform evaluation of received information against existing RMP information.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-202 -> The Recognized Maritime Picture Manager, both Regional and at the Operational level, shall support resolution of detected ambiguities within RMP information.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-204 -> The Recognized Maritime Picture Services shall be able to filter the transmitted RMP information.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-228 -> RMP - Both RMP Managers and MNPs shall ensure they depart the network correctly.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-94 -> RMP - The Recognized Maritime Picture Manager, both Regional and at the Operational level, shall be able to receive contribution in the form of White Shipping data.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-97 -> Secure log-on shall be enforced for user authentication.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-98 -> RMP services shall log specified events

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail

#### SP5-SREQ-99 -> All OTH-T-Gold messages shall conform to standardization detail.

- TCA-CIAV-016243 -> REPO-00481-OTH-GOLD Data Exchange - Contact Report - EMail



### SP5-TIN-22 -> MTF Exchange - Maritime Tasking and Reporting Consumer

#### SP5-SREQ-128 -> RMP - Data Exchange - MNPs shall be able to exchange APP-11 messages (built from the rules contained in ADatP-3).

- TCA-CIAV-012078 -> REPO-00485-Provision of JMEI/OPTASK RMP and SV-1 to MNP

- TCA-CIAV-012080 -> REPO-04727-Maritime Network Exiting

- TCA-CIAV-016236 -> REPO-05677-APP-11 Data Exchange - RMPSITSUM

- TCA-CIAV-016237 -> REPO-00301-APP-11 Data Exchange - NAVSITREP

- TCA-CIAV-016238 -> REPO-05676-APP-11 Data Exchange - OPNOTE

- TCA-CIAV-016248 -> REPO-00296-RMP System Configured and Active

- TCA-CIAV-016251 -> REPO-04679-Disseminate Orders and Taskings

- TCA-CIAV-016255 -> REPO-00460-APP-11 Data transmission - RMPSITSUM (RMP Situation Summary)

- TCA-CIAV-016260 -> REPO-00276-Provision of MNPs RMP service Technical Specs and Capabilities to the RMP SMA



### SP5-TIN-22 -> MTF Exchange - Maritime Tasking and Reporting Provider

#### SP5-SREQ-128 -> RMP - Data Exchange - MNPs shall be able to exchange APP-11 messages (built from the rules contained in ADatP-3).

- TCA-CIAV-012078 -> REPO-00485-Provision of JMEI/OPTASK RMP and SV-1 to MNP

- TCA-CIAV-012080 -> REPO-04727-Maritime Network Exiting

- TCA-CIAV-016236 -> REPO-05677-APP-11 Data Exchange - RMPSITSUM

- TCA-CIAV-016237 -> REPO-00301-APP-11 Data Exchange - NAVSITREP

- TCA-CIAV-016238 -> REPO-05676-APP-11 Data Exchange - OPNOTE

- TCA-CIAV-016251 -> REPO-04679-Disseminate Orders and Taskings

- TCA-CIAV-016255 -> REPO-00460-APP-11 Data transmission - RMPSITSUM (RMP Situation Summary)

- TCA-CIAV-016260 -> REPO-00276-Provision of MNPs RMP service Technical Specs and Capabilities to the RMP SMA



### SP5-TIN-376 -> OTH-T-Gold Message Exchange via TCP/IP Consumer

#### SP5-SREQ-120 -> RMP- Dissemination - The RMP Manager, both Regional and at the Operational level, shall disseminate the RMP by the use of GOLD Messages - TCP

- TCA-CIAV-012062 -> REPO-00043-Communications and RMP Service Check

- TCA-CIAV-012080 -> REPO-04727-Maritime Network Exiting

- TCA-CIAV-016228 -> REPO-00024-OTH-GOLD Whiteshipping Data (OTH-G)

- TCA-CIAV-016229 -> REPO-05669-OTH-GOLD Data Exchange - Optional Messages - SCREEN KILO

- TCA-CIAV-016231 -> REPO-00146-RMP Filtering and Dissemination Global RMP Manager to Local RMP Manager

- TCA-CIAV-016232 -> REPO-05668-OTH-GOLD Data Exchange - Optional Messages - PIMTRACK

- TCA-CIAV-016233 -> REPO-00217-OTH-GOLD Data Exchange - Graphics Overlays

- TCA-CIAV-016234 -> REPO-00275-OTH-GOLD Data Processing, Build and Share RMP (2007) (OTH-G)

- TCA-CIAV-016235 -> REPO-00280-AIS data forwarding to RMP

- TCA-CIAV-016238 -> REPO-05676-APP-11 Data Exchange - OPNOTE

- TCA-CIAV-016240 -> REPO-05671-OTH-GOLD Data Exchange - Optional Messages - FOTC SITREP

- TCA-CIAV-016241 -> REPO-00412-OTH-GOLD Whiteshipping Data (Revision 2007) (OTH-G) stress test

- TCA-CIAV-016244 -> REPO-05675-OTH-GOLD Data Exchange - Optional Messages - OPNOTE

- TCA-CIAV-016246 -> REPO-05670-OTH-GOLD Data Exchange - Optional Messages - 4-WHISKY

- TCA-CIAV-016250 -> REPO-00070-RMP Filtering and Dissemination Local RMP Manager to Global RMP Manager

- TCA-CIAV-016252 -> REPO-05682-OTH-GOLD Data Exchange - XCTC Contact Report

- TCA-CIAV-016254 -> REPO-00196-OTH-GOLD Data Exchange - RMP Management

- TCA-CIAV-016255 -> REPO-00460-APP-11 Data transmission - RMPSITSUM (RMP Situation Summary)

- TCA-CIAV-016256 -> REPO-00511-OTH-GOLD Data Exchange - CTC Contact Report



### SP5-TIN-376 -> OTH-T-Gold Message Exchange via TCP/IP Provider

#### SP5-SREQ-120 -> RMP- Dissemination - The RMP Manager, both Regional and at the Operational level, shall disseminate the RMP by the use of GOLD Messages - TCP

- TCA-CIAV-012062 -> REPO-00043-Communications and RMP Service Check

- TCA-CIAV-012080 -> REPO-04727-Maritime Network Exiting

- TCA-CIAV-016228 -> REPO-00024-OTH-GOLD Whiteshipping Data (OTH-G)

- TCA-CIAV-016229 -> REPO-05669-OTH-GOLD Data Exchange - Optional Messages - SCREEN KILO

- TCA-CIAV-016231 -> REPO-00146-RMP Filtering and Dissemination Global RMP Manager to Local RMP Manager

- TCA-CIAV-016232 -> REPO-05668-OTH-GOLD Data Exchange - Optional Messages - PIMTRACK

- TCA-CIAV-016233 -> REPO-00217-OTH-GOLD Data Exchange - Graphics Overlays

- TCA-CIAV-016234 -> REPO-00275-OTH-GOLD Data Processing, Build and Share RMP (2007) (OTH-G)

- TCA-CIAV-016235 -> REPO-00280-AIS data forwarding to RMP

- TCA-CIAV-016238 -> REPO-05676-APP-11 Data Exchange - OPNOTE

- TCA-CIAV-016240 -> REPO-05671-OTH-GOLD Data Exchange - Optional Messages - FOTC SITREP

- TCA-CIAV-016241 -> REPO-00412-OTH-GOLD Whiteshipping Data (Revision 2007) (OTH-G) stress test

- TCA-CIAV-016244 -> REPO-05675-OTH-GOLD Data Exchange - Optional Messages - OPNOTE

- TCA-CIAV-016246 -> REPO-05670-OTH-GOLD Data Exchange - Optional Messages - 4-WHISKY

- TCA-CIAV-016248 -> REPO-00296-RMP System Configured and Active

- TCA-CIAV-016250 -> REPO-00070-RMP Filtering and Dissemination Local RMP Manager to Global RMP Manager

- TCA-CIAV-016252 -> REPO-05682-OTH-GOLD Data Exchange - XCTC Contact Report

- TCA-CIAV-016254 -> REPO-00196-OTH-GOLD Data Exchange - RMP Management

- TCA-CIAV-016255 -> REPO-00460-APP-11 Data transmission - RMPSITSUM (RMP Situation Summary)

- TCA-CIAV-016256 -> REPO-00511-OTH-GOLD Data Exchange - CTC Contact Report



### SP5-TIN-377 -> OTH-T-Gold Message Exchange via email Consumer

#### SP5-SREQ-123 -> RMP- Dissemination - MNPs unable to process GOLD Messages automatically by C2 system or Message Handling System shall use Email. This REQ is not applicable for dissemenation from the Operational level (eg.HQ MARCOM).

- TCA-CIAV-016230 -> REPO-00142-RMP Sharing by E-Mail - No CCIS



### SP5-TIN-377 -> OTH-T-Gold Message Exchange via email Provider

#### SP5-SREQ-123 -> RMP- Dissemination - MNPs unable to process GOLD Messages automatically by C2 system or Message Handling System shall use Email. This REQ is not applicable for dissemenation from the Operational level (eg.HQ MARCOM).

- TCA-CIAV-016230 -> REPO-00142-RMP Sharing by E-Mail - No CCIS



## SP5-SI-NTP -> Distributed Time

### SP5-TIN-20 -> Federation Time Distribution Consumer

#### SP5-SREQ-1000 -> The time difference between any synchronized device and the UTC shall never be higher than 0.5s.

- TCA-CIAV-011947 -> Verify Systems  are synchronized with a  local NTP source

- TCA-CIAV-011956 -> Verify Systems  are synchronized with a federated NTP source - NTP Check

- TCA-CIAV-016578 -> Provider: REPO-00215 Time Synchronization

- TCA-CIAV-016832 -> Time difference between any device lower than 0.5s

#### SP5-SREQ-166 -> All Service Providers shall synchronize time by either connecting their internal time server(s) to a time server identified by the MN Service Management Authority or by providing their own reference clock.

- TCA-CIAV-011947 -> Verify Systems  are synchronized with a  local NTP source

- TCA-CIAV-012032 -> Media - Dependencies: Time Service - Video

- TCA-CIAV-016578 -> Provider: REPO-00215 Time Synchronization

- TCA-CIAV-016831 -> MNP Internal time synchronization

- TCA-CIAV-017145 -> 3100: REPO-00245-MNP performs time synchronization

#### SP5-SREQ-38 -> All exchanges between NTP servers shall be authenticated with symmetric key authentication based on MD5 hash algorithm.

- TCA-CIAV-016835 -> MD5 based authentication

#### SP5-SREQ-51 -> Events shall be logged for all servers in the NTP hierarchy. Where relevant and available, event logs must include at least: rogue time is provided by legitimate source; and when time source is not correctly authenticated.

- TCA-CIAV-016829 -> Event Logging



### SP5-TIN-20 -> Federation Time Distribution Provider

#### SP5-SREQ-1001 -> Distributed Time Services shall use the Coordinated Universal Time (UTC) Standard.

- TCA-CIAV-011947 -> Verify Systems  are synchronized with a  local NTP source

- TCA-CIAV-011956 -> Verify Systems  are synchronized with a federated NTP source - NTP Check

- TCA-CIAV-016830 -> Synchronization using UTC

#### SP5-SREQ-38 -> All exchanges between NTP servers shall be authenticated with symmetric key authentication based on MD5 hash algorithm.

- TCA-CIAV-016835 -> MD5 based authentication

#### SP5-SREQ-51 -> Events shall be logged for all servers in the NTP hierarchy. Where relevant and available, event logs must include at least: rogue time is provided by legitimate source; and when time source is not correctly authenticated.

- TCA-CIAV-016829 -> Event Logging



### SP5-TIN-23 -> Federation Peer Synchronization Collaborator

#### SP5-SREQ-1160 -> Synchronizing timeservers shall operate on the same stratum and shall have synchronization path leading to the same reference clock.

- TCA-CIAV-012984 -> REPO-00447-Server - Peering - SP5

- TCA-CIAV-016843 -> Peering is active between Stratum-2 Time Servers

#### SP5-SREQ-38 -> All exchanges between NTP servers shall be authenticated with symmetric key authentication based on MD5 hash algorithm.

- TCA-CIAV-016835 -> MD5 based authentication

#### SP5-SREQ-51 -> Events shall be logged for all servers in the NTP hierarchy. Where relevant and available, event logs must include at least: rogue time is provided by legitimate source; and when time source is not correctly authenticated.

- TCA-CIAV-016829 -> Event Logging



## SP5-SI-OVLYD -> Overlay Distribution

### SP5-TIN-17 -> NVG Overlay Exchange via Files Consumer

#### SP5-SREQ-232 -> Only privileged users shall have access to generate and transfer files.

#### SP5-SREQ-300 -> MNP shall be able to load an NVG file and display the content in its C2 system.

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

- TCA-CIAV-016582 -> Consumer: Native generic NVG shapes

- TCA-CIAV-016615 -> Correct speed for equipment symbols

- TCA-CIAV-016616 -> Use of time information in NVG metadata

- TCA-CIAV-016619 -> Security Markings can be exchanged

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016695 -> Consumer: Display grouped NVG objects

- TCA-CIAV-016998 -> Consumer: Security markings from NVG overlays can be displayed

- TCA-CIAV-016999 -> Consumer: Local MOR Symbols Display from NVG file

- TCA-CIAV-017000 -> Consumer: Native NVG objects with styling can be displayed

- TCA-CIAV-017083 -> Event Battlespace Geometry - NVG files - Informal messaging

- TCA-CIAV-017087 -> Event Battlespace Geometry - NVG files - Chat (Text-based Collaboration)

- TCA-CIAV-017090 -> Event Battlespace Geometry - NVG files - Web-based Collaboration (Portal)

- TCA-CIAV-017238 -> Consumer: Local coordinate precision and map alignment

- TCA-CIAV-017242 -> Consumer: Display of additional metadata for NVG objects

- TCA-CIAV-017243 -> Consumer: Verify display of APP6(D) symbology

- TCA-CIAV-017245 -> Consumer: Areas around polar areas

- TCA-CIAV-017493 -> Situation Awareness Overlay exchange - NVG files - Informal messaging 

- TCA-CIAV-017494 -> Situation Awareness Overlay exchange - NVG files - Web Portal

#### SP5-SREQ-301 -> MNP shall be able to save the data from its C2 system as a NVG file.

#### SP5-SREQ-306 -> Servers shall mutually authenticate using certificates.

#### SP5-SREQ-509 -> Mission Participants shall be able to provide standardized, representative, battlespace objects.

#### SP5-SREQ-511 -> The Service shall enable the sharing of information across communities of interest

#### SP5-SREQ-590 -> Mission Participants shall be able to provide standardized, representative, Overlays

#### SP5-SREQ-591 -> Mission Participant shall be able to support multiple different Overlay Exchange patterns

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

#### SP5-SREQ-592 -> MNP shall provide a Link-back (URL) for a symbol for which it can and will make additional information available.

#### SP5-SREQ-82 -> HTTPS shall be used as the transport protocol.

#### SP5-SREQ-87 -> MNP shall encode military symbols using the APP-6(D)(1) symbology standard when using NVG.

#### SP5-SREQ-89 -> NVG files shall be labelled using STANAG 4774/4778-compliant labels.

#### SP5-SREQ-90 -> Services receiving NVG messages must validate received messages to ensure they conform to the NVG schema.

- TCA-CIAV-016617 -> Consumer: Robustness to handle invalid NVG data

#### SP5-SREQ-92 -> Overlay Information shall be logged in the system Event Logs



### SP5-TIN-17 -> NVG Overlay Exchange via Files Provider

#### SP5-SREQ-232 -> Only privileged users shall have access to generate and transfer files.

- TCA-CIAV-016635 -> Provider: Authorization generating files with overlays

#### SP5-SREQ-300 -> MNP shall be able to load an NVG file and display the content in its C2 system.

- TCA-CIAV-016570 -> Provider: REPO-00173 Save and Load NVG File Locally

#### SP5-SREQ-301 -> MNP shall be able to save the data from its C2 system as a NVG file.

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

- TCA-CIAV-016570 -> Provider: REPO-00173 Save and Load NVG File Locally

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

- TCA-CIAV-016615 -> Correct speed for equipment symbols

- TCA-CIAV-016616 -> Use of time information in NVG metadata

- TCA-CIAV-016619 -> Security Markings can be exchanged

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-017083 -> Event Battlespace Geometry - NVG files - Informal messaging

- TCA-CIAV-017087 -> Event Battlespace Geometry - NVG files - Chat (Text-based Collaboration)

- TCA-CIAV-017090 -> Event Battlespace Geometry - NVG files - Web-based Collaboration (Portal)

- TCA-CIAV-017493 -> Situation Awareness Overlay exchange - NVG files - Informal messaging 

- TCA-CIAV-017494 -> Situation Awareness Overlay exchange - NVG files - Web Portal

#### SP5-SREQ-306 -> Servers shall mutually authenticate using certificates.

#### SP5-SREQ-509 -> Mission Participants shall be able to provide standardized, representative, battlespace objects.

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

- TCA-CIAV-016615 -> Correct speed for equipment symbols

- TCA-CIAV-016616 -> Use of time information in NVG metadata

- TCA-CIAV-016618 -> Provider: Consistent attribute values for BSOs

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

#### SP5-SREQ-511 -> The Service shall enable the sharing of information across communities of interest

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

#### SP5-SREQ-590 -> Mission Participants shall be able to provide standardized, representative, Overlays

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

- TCA-CIAV-016570 -> Provider: REPO-00173 Save and Load NVG File Locally

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

- TCA-CIAV-016615 -> Correct speed for equipment symbols

- TCA-CIAV-016616 -> Use of time information in NVG metadata

- TCA-CIAV-016618 -> Provider: Consistent attribute values for BSOs

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

#### SP5-SREQ-591 -> Mission Participant shall be able to support multiple different Overlay Exchange patterns

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

#### SP5-SREQ-592 -> MNP shall provide a Link-back (URL) for a symbol for which it can and will make additional information available.

- TCA-CIAV-016615 -> Correct speed for equipment symbols

#### SP5-SREQ-82 -> HTTPS shall be used as the transport protocol.

#### SP5-SREQ-87 -> MNP shall encode military symbols using the APP-6(D)(1) symbology standard when using NVG.

- TCA-CIAV-016561 -> Provider: REPO-05540 Verify NVG and symbology version

- TCA-CIAV-016565 -> REPO-02881 Exchange NVG overlay files using Informal Messaging Service

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

#### SP5-SREQ-89 -> NVG files shall be labelled using STANAG 4774/4778-compliant labels.

- TCA-CIAV-016619 -> Security Markings can be exchanged

- TCA-CIAV-016639 -> Provider: NVG overlays contain security markings

#### SP5-SREQ-90 -> Services receiving NVG messages must validate received messages to ensure they conform to the NVG schema.

#### SP5-SREQ-92 -> Overlay Information shall be logged in the system Event Logs

- TCA-CIAV-016635 -> Provider: Authorization generating files with overlays



### SP5-TIN-18 -> KML Overlay Exchange via Files Consumer

#### SP5-SREQ-231 -> Exchange and control of KML files shall be controlled.

#### SP5-SREQ-232 -> Only privileged users shall have access to generate and transfer files.

#### SP5-SREQ-258 -> MNP shall be able to load a KML file and display the content in its C2 system.

- TCA-CIAV-016563 -> REPO-03394 Exchange KML overlay files

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016623 -> Metadata on KML overlays

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016644 -> Provider: Save and Load KML File Locally

- TCA-CIAV-016686 -> Export unclassified KML to civilian parties

- TCA-CIAV-017091 -> Event Battlespace Geometry - KML files - Informal Messaging

- TCA-CIAV-017093 -> Event Battlespace Geometry - KML files - Chat (Text-based Collaboration)

- TCA-CIAV-017094 -> Event Battlespace Geometry - KML files - Web-based Collaboration (Portal)

#### SP5-SREQ-299 -> MNP shall be able to save data from its C2 system as a KML file.

#### SP5-SREQ-302 -> MNP shall be able to provide standardized, representative, KML Overlays.

#### SP5-SREQ-306 -> Servers shall mutually authenticate using certificates.

#### SP5-SREQ-509 -> Mission Participants shall be able to provide standardized, representative, battlespace objects.

#### SP5-SREQ-511 -> The Service shall enable the sharing of information across communities of interest

- TCA-CIAV-016686 -> Export unclassified KML to civilian parties

#### SP5-SREQ-591 -> Mission Participant shall be able to support multiple different Overlay Exchange patterns

#### SP5-SREQ-82 -> HTTPS shall be used as the transport protocol.

#### SP5-SREQ-92 -> Overlay Information shall be logged in the system Event Logs



### SP5-TIN-18 -> KML Overlay Exchange via Files Provider

#### SP5-SREQ-231 -> Exchange and control of KML files shall be controlled.

- TCA-CIAV-016635 -> Provider: Authorization generating files with overlays

#### SP5-SREQ-232 -> Only privileged users shall have access to generate and transfer files.

- TCA-CIAV-016635 -> Provider: Authorization generating files with overlays

#### SP5-SREQ-258 -> MNP shall be able to load a KML file and display the content in its C2 system.

#### SP5-SREQ-299 -> MNP shall be able to save data from its C2 system as a KML file.

- TCA-CIAV-016563 -> REPO-03394 Exchange KML overlay files

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016623 -> Metadata on KML overlays

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016644 -> Provider: Save and Load KML File Locally

- TCA-CIAV-016645 -> Provider: Local MOR Symbols Exchange via KML

- TCA-CIAV-016686 -> Export unclassified KML to civilian parties

- TCA-CIAV-017091 -> Event Battlespace Geometry - KML files - Informal Messaging

- TCA-CIAV-017093 -> Event Battlespace Geometry - KML files - Chat (Text-based Collaboration)

- TCA-CIAV-017094 -> Event Battlespace Geometry - KML files - Web-based Collaboration (Portal)

#### SP5-SREQ-302 -> MNP shall be able to provide standardized, representative, KML Overlays.

- TCA-CIAV-016563 -> REPO-03394 Exchange KML overlay files

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016623 -> Metadata on KML overlays

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016643 -> Provider: Verify KML version

- TCA-CIAV-016645 -> Provider: Local MOR Symbols Exchange via KML

- TCA-CIAV-016686 -> Export unclassified KML to civilian parties

- TCA-CIAV-017091 -> Event Battlespace Geometry - KML files - Informal Messaging

- TCA-CIAV-017093 -> Event Battlespace Geometry - KML files - Chat (Text-based Collaboration)

- TCA-CIAV-017094 -> Event Battlespace Geometry - KML files - Web-based Collaboration (Portal)

#### SP5-SREQ-306 -> Servers shall mutually authenticate using certificates.

#### SP5-SREQ-509 -> Mission Participants shall be able to provide standardized, representative, battlespace objects.

- TCA-CIAV-016563 -> REPO-03394 Exchange KML overlay files

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016623 -> Metadata on KML overlays

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016645 -> Provider: Local MOR Symbols Exchange via KML

- TCA-CIAV-016686 -> Export unclassified KML to civilian parties

- TCA-CIAV-017094 -> Event Battlespace Geometry - KML files - Web-based Collaboration (Portal)

#### SP5-SREQ-511 -> The Service shall enable the sharing of information across communities of interest

- TCA-CIAV-016563 -> REPO-03394 Exchange KML overlay files

- TCA-CIAV-016623 -> Metadata on KML overlays

- TCA-CIAV-016643 -> Provider: Verify KML version

- TCA-CIAV-016645 -> Provider: Local MOR Symbols Exchange via KML

- TCA-CIAV-016686 -> Export unclassified KML to civilian parties

#### SP5-SREQ-591 -> Mission Participant shall be able to support multiple different Overlay Exchange patterns

#### SP5-SREQ-82 -> HTTPS shall be used as the transport protocol.

#### SP5-SREQ-92 -> Overlay Information shall be logged in the system Event Logs

- TCA-CIAV-016635 -> Provider: Authorization generating files with overlays



### SP5-TIN-19 -> NVG Overlay Exchange via Web Services Consumer

#### SP5-SREQ-232 -> Only privileged users shall have access to generate and transfer files.

#### SP5-SREQ-254 -> MNP shall be able to connect to a Request-Response NVG Service, request an NVG overlay and display it on the C2 system.

- TCA-CIAV-016566 -> REPO-00073 Exchange NVG overlays using the Request/Response service

- TCA-CIAV-016567 -> REPO-00101 Exchange BSO with Linkback Data and browse for the URL

- TCA-CIAV-016569 -> REPO-00136 Remote DNS lookup check

- TCA-CIAV-016579 -> REPO-00252 Remote Communications Check

- TCA-CIAV-016580 -> REPO-00151 Remote HTTPS Certificate Validation

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

- TCA-CIAV-016615 -> Correct speed for equipment symbols

- TCA-CIAV-016616 -> Use of time information in NVG metadata

- TCA-CIAV-016619 -> Security Markings can be exchanged

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016642 -> Forward NVG overlays

- TCA-CIAV-017095 -> Event Battlespace Geometry - NVG Web Services

- TCA-CIAV-017495 -> Situation Awareness Overlay exchange - NVG - Web services

#### SP5-SREQ-255 -> MNP shall be capable to host a Request-Response NVG Service to share NVG overlays.

#### SP5-SREQ-256 -> MNP shall be able to obtain the additional information for a symbol by following the given link-back (URL) of the provider.

- TCA-CIAV-016567 -> REPO-00101 Exchange BSO with Linkback Data and browse for the URL

- TCA-CIAV-016615 -> Correct speed for equipment symbols

#### SP5-SREQ-257 -> MNP shall provide additional information for a symbol via the provided link-back (URL) when the consumer follows the link-back reference.

#### SP5-SREQ-509 -> Mission Participants shall be able to provide standardized, representative, battlespace objects.

#### SP5-SREQ-511 -> The Service shall enable the sharing of information across communities of interest

#### SP5-SREQ-591 -> Mission Participant shall be able to support multiple different Overlay Exchange patterns

#### SP5-SREQ-91 -> TLS Security - between Servers shall be by mutual authentication.

- TCA-CIAV-016621 -> Mutual TLS for Overlay Consumer authentication



### SP5-TIN-19 -> NVG Overlay Exchange via Web Services Provider

#### SP5-SREQ-232 -> Only privileged users shall have access to generate and transfer files.

#### SP5-SREQ-254 -> MNP shall be able to connect to a Request-Response NVG Service, request an NVG overlay and display it on the C2 system.

#### SP5-SREQ-255 -> MNP shall be capable to host a Request-Response NVG Service to share NVG overlays.

- TCA-CIAV-016564 -> Provider: REPO-03372 Local communications check

- TCA-CIAV-016566 -> REPO-00073 Exchange NVG overlays using the Request/Response service

- TCA-CIAV-016567 -> REPO-00101 Exchange BSO with Linkback Data and browse for the URL

- TCA-CIAV-016569 -> REPO-00136 Remote DNS lookup check

- TCA-CIAV-016572 -> Provider: REPO-02878 Publish and browse NVG Linkback Data from Local Client

- TCA-CIAV-016573 -> Provider: REPO-00473 Verify local access to NVG Service and Overlay content

- TCA-CIAV-016574 -> Provider: REPO-00452 Local DNS lookup check

- TCA-CIAV-016577 -> Provider: REPO-00313 Local HTTPS Certificate Validation

- TCA-CIAV-016579 -> REPO-00252 Remote Communications Check

- TCA-CIAV-016580 -> REPO-00151 Remote HTTPS Certificate Validation

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

- TCA-CIAV-016615 -> Correct speed for equipment symbols

- TCA-CIAV-016616 -> Use of time information in NVG metadata

- TCA-CIAV-016619 -> Security Markings can be exchanged

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016642 -> Forward NVG overlays

- TCA-CIAV-017095 -> Event Battlespace Geometry - NVG Web Services

- TCA-CIAV-017495 -> Situation Awareness Overlay exchange - NVG - Web services

#### SP5-SREQ-256 -> MNP shall be able to obtain the additional information for a symbol by following the given link-back (URL) of the provider.

#### SP5-SREQ-257 -> MNP shall provide additional information for a symbol via the provided link-back (URL) when the consumer follows the link-back reference.

- TCA-CIAV-016567 -> REPO-00101 Exchange BSO with Linkback Data and browse for the URL

- TCA-CIAV-016572 -> Provider: REPO-02878 Publish and browse NVG Linkback Data from Local Client

- TCA-CIAV-016615 -> Correct speed for equipment symbols

#### SP5-SREQ-509 -> Mission Participants shall be able to provide standardized, representative, battlespace objects.

- TCA-CIAV-016566 -> REPO-00073 Exchange NVG overlays using the Request/Response service

- TCA-CIAV-016567 -> REPO-00101 Exchange BSO with Linkback Data and browse for the URL

- TCA-CIAV-016581 -> REPO-00293 MOR Symbols Exchange

- TCA-CIAV-016615 -> Correct speed for equipment symbols

- TCA-CIAV-016616 -> Use of time information in NVG metadata

- TCA-CIAV-016620 -> Coordinate precision and map alignment

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

- TCA-CIAV-016642 -> Forward NVG overlays

#### SP5-SREQ-511 -> The Service shall enable the sharing of information across communities of interest

- TCA-CIAV-016641 -> Attribute mapping from C2 data sources

#### SP5-SREQ-591 -> Mission Participant shall be able to support multiple different Overlay Exchange patterns

#### SP5-SREQ-91 -> TLS Security - between Servers shall be by mutual authentication.

- TCA-CIAV-016577 -> Provider: REPO-00313 Local HTTPS Certificate Validation

- TCA-CIAV-016621 -> Mutual TLS for Overlay Consumer authentication



## SP5-SI-PCN -> Protected Core Networking

### SP5-TIN-100 -> PCN-2 Interface Consumer

#### SP5-SREQ-1261 -> Non-collocated PCN-2 must be operated as GRE-tunnel over IPSec transport mode service with IPv4 protocol in GRE passenger, and either IPv4 or IPv6 in carrier.

- TCA-CIAV-012977 -> Verify MTU size for PCN-2

- TCA-CIAV-013033 -> PCN-2 Routing functional

#### SP5-SREQ-1262 -> Collocated PCN-2 shall be operated with or without GRE-tunnel over IPSec transport mode service with IPv4 protocol in GRE passenger, and either IPv4 or IPv6 in carrier.

- TCA-CIAV-012977 -> Verify MTU size for PCN-2

- TCA-CIAV-013033 -> PCN-2 Routing functional

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-012977 -> Verify MTU size for PCN-2

- TCA-CIAV-013033 -> PCN-2 Routing functional



### SP5-TIN-100 -> PCN-2 Interface Provider

#### SP5-SREQ-1261 -> Non-collocated PCN-2 must be operated as GRE-tunnel over IPSec transport mode service with IPv4 protocol in GRE passenger, and either IPv4 or IPv6 in carrier.

- TCA-CIAV-012977 -> Verify MTU size for PCN-2

- TCA-CIAV-013033 -> PCN-2 Routing functional

- TCA-CIAV-014462 -> QoS policy

#### SP5-SREQ-1262 -> Collocated PCN-2 shall be operated with or without GRE-tunnel over IPSec transport mode service with IPv4 protocol in GRE passenger, and either IPv4 or IPv6 in carrier.

- TCA-CIAV-012977 -> Verify MTU size for PCN-2

- TCA-CIAV-013033 -> PCN-2 Routing functional

- TCA-CIAV-014462 -> QoS policy

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-012977 -> Verify MTU size for PCN-2

- TCA-CIAV-013033 -> PCN-2 Routing functional

- TCA-CIAV-014462 -> QoS policy



### SP5-TIN-104 -> Inter-PCS Unicast Routing Collaborator

#### SP5-SREQ-1100 -> BGP sessions must be authenticated using MD5 hash

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority

#### SP5-SREQ-1101 -> Route filtering of valid mission network prefixes shall be implemented in BGP.

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority

#### SP5-SREQ-1102 -> Route import filtering for BGP must be implemented to prevent direct propagation of Service Provider internal routing protocol routes to the MN routing.

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority

#### SP5-SREQ-1105 -> Bidirectional Forwarding Detection shall be used for BGP liveness detection.

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority

#### SP5-SREQ-1106 -> Generalized TTL Security Mechanism shall be implement for BGP sessions

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority

#### SP5-SREQ-1128 -> BGP route filtering must be implement to allow only administratevily allowed communities over the BGP peering

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority

#### SP5-SREQ-188 -> Communications Services Providers must provide transparent routing infrastructure based on BGP routing protocol.

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority

#### SP5-SREQ-315 -> Protected Core Segment Provider must announce hosted PCSC IP address prefix(es) to the rest of the Protected Core in BGP routing.

- TCA-CIAV-014464 -> BGP Default Routes

- TCA-CIAV-016860 -> Protected Core Addressing Authority



### SP5-TIN-113 -> Protected Core P-functionality Consumer

#### SP5-SREQ-1207 -> PCore Service Consumer (PCSC) shall not transit unicast traffic for other entities than local users within PCSC.

- TCA-CIAV-017069 -> P-function 

- TCA-CIAV-017072 -> Federate P-function



### SP5-TIN-113 -> Protected Core P-functionality Provider

#### SP5-SREQ-1206 -> P-functionality shall forward Protected Core Service Consumer (PCSC) communications service traffic transparently

- TCA-CIAV-017069 -> P-function 

- TCA-CIAV-017072 -> Federate P-function



### SP5-TIN-118 -> NMCD Administrative Information Exchange Provider

#### SP5-SREQ-1126 -> An NMCD IES server must offer a well-known URI where clients can discover the location of the NMCD IES API end-point (i.e. a resource path prefix).

- TCA-CIAV-017437 -> NMCD Information Exchange Preparation 



### SP5-TIN-350 -> NMCD Information Exchange Service Provider

#### SP5-SREQ-1124 -> NMCD IES must authenticate with x509v3 certificates in TLS

- TCA-CIAV-012958 -> NMCD Data Model Validation PCN

#### SP5-SREQ-1127 -> NMCD information exchange shall happen between peering entities and in global sense hop-by-hop

- TCA-CIAV-012958 -> NMCD Data Model Validation PCN



### SP5-TIN-96 -> PCN Interface Authentication Collaborator

#### SP5-SREQ-1121 -> Traffic flow confidentiality protected PCN interfaces shall be authenticated with IPSec IKEv2 exchange of x509v3 Digital Certificates.

- TCA-CIAV-013001 -> IPSec Profile for PCN-2

- TCA-CIAV-013002 -> IPSec Profile for PCN-1



### SP5-TIN-97 -> PCN Interface Traffic Flow Confidentiality Protection Collaborator

#### SP5-SREQ-1120 -> Traffic flow confidentiality protected PCN interfaces shall be protected with IPSec ESP in Transport Mode

- TCA-CIAV-017034 -> QoS TFC



### SP5-TIN-98 -> PCN Interface Auto-configuration Collaborator

#### SP5-SREQ-1263 -> PCN-1 and PCN-2 auto configuration shall support RIPv2 for rapid discovery of peering entities over Ethernet LAN

- TCA-CIAV-016633 -> PCN-1 autoconfiguration

- TCA-CIAV-016634 -> PCN-2 autoconfiguration

#### SP5-SREQ-1264 -> PCN-1 and PCN-2 auto configuration shall support RIPng for service discovery of peering entities

- TCA-CIAV-016633 -> PCN-1 autoconfiguration

- TCA-CIAV-016634 -> PCN-2 autoconfiguration



### SP5-TIN-99 -> PCN-1 Interface Collaborator

#### SP5-SREQ-1131 -> Non-collocated PCN-1 must be operated as GRE-tunnel over IPSec transport mode service with IPv4 protocol in GRE passenger, and either IPv4 or IPv6 in carrier.

- TCA-CIAV-012974 -> Verify MTU size for PCN-1

- TCA-CIAV-013014 -> BGP Routing for PCN-1

- TCA-CIAV-016629 -> Logical Connection Addressing PCN-1

- TCA-CIAV-016631 -> BGP Authentication and TTL security

- TCA-CIAV-016859 -> QoS IP performance expression

#### SP5-SREQ-1132 -> Collocated PCN-1 shall be operated with or without GRE-tunnel over IPSec transport mode service with IPv4 protocol in GRE passenger, and either IPv4 or IPv6 in carrier.

- TCA-CIAV-012974 -> Verify MTU size for PCN-1

- TCA-CIAV-013014 -> BGP Routing for PCN-1

- TCA-CIAV-016629 -> Logical Connection Addressing PCN-1

- TCA-CIAV-016631 -> BGP Authentication and TTL security

- TCA-CIAV-016859 -> QoS IP performance expression

#### SP5-SREQ-316 -> Service providers shall police, shape and schedule traffic according to mission QoS policy for interface SLA they have for the connection.

- TCA-CIAV-012974 -> Verify MTU size for PCN-1

- TCA-CIAV-013014 -> BGP Routing for PCN-1

- TCA-CIAV-016629 -> Logical Connection Addressing PCN-1

- TCA-CIAV-016631 -> BGP Authentication and TTL security

- TCA-CIAV-016859 -> QoS IP performance expression

- TCA-CIAV-016887 -> QoS policy



## SP5-SI-PKI -> Digital Certificates

### SP5-TIN-52 -> Trust Management (Trust List) Consumer

#### SP5-SREQ-1294 -> All mission network participants shall be able to support the creation, maintenance and distribution of Certificate Trust List.

- TCA-CIAV-014513 -> Certificate Authority Trust Verification

#### SP5-SREQ-36 -> All mission network participant shall be able to establish a trust with other federation participants using Trust List

- TCA-CIAV-014513 -> Certificate Authority Trust Verification

- TCA-CIAV-014523 -> Check Trust Anchor List Import



### SP5-TIN-52 -> Trust Management (Trust List) Provider

#### SP5-SREQ-1294 -> All mission network participants shall be able to support the creation, maintenance and distribution of Certificate Trust List.

- TCA-CIAV-014523 -> Check Trust Anchor List Import

#### SP5-SREQ-36 -> All mission network participant shall be able to establish a trust with other federation participants using Trust List

- TCA-CIAV-014523 -> Check Trust Anchor List Import



### SP5-TIN-53 -> Trust Management (Cross-certification) Provider

#### SP5-SREQ-37 -> Mission network participants shall be able to establish a trust with other federation participants using a cross-certification trust model.

- TCA-CIAV-014516 -> Certificate Authority Cross Certification Verification



### SP5-TIN-54 -> Certificate Request Consumer

#### SP5-SREQ-296 -> Private keys transmitted across the network shall be encrypted.

- TCA-CIAV-014538 -> Generating Certificate Request and Corresponding Certificate

#### SP5-SREQ-35 -> The Digital Certificate Services shall be able to generate certificate request

- TCA-CIAV-014538 -> Generating Certificate Request and Corresponding Certificate



### SP5-TIN-54 -> Certificate Request Provider

#### SP5-SREQ-1293 -> The Digital Certificate Services shall be able to issue certificate based on the certificate request

- TCA-CIAV-014538 -> Generating Certificate Request and Corresponding Certificate

#### SP5-SREQ-296 -> Private keys transmitted across the network shall be encrypted.

- TCA-CIAV-014538 -> Generating Certificate Request and Corresponding Certificate



### SP5-TIN-55 -> Certificates Issuance and Life-cycle Management Consumer

#### SP5-SREQ-296 -> Private keys transmitted across the network shall be encrypted.

- TCA-CIAV-017441 -> Federated certificate issuance



### SP5-TIN-55 -> Certificates Issuance and Life-cycle Management Provider

#### SP5-SREQ-1156 -> The Digital Certificate Services shall provide (potentially multiple) CRL location(s) in issued digital certificates through the cRLDistributionPoints extension.

- TCA-CIAV-014536 -> Revoking a Issued Certificate

#### SP5-SREQ-1157 -> The Digital Certificate Services shall provide the location of OCSP responders in issued digital certificates through the AIA extension.

- TCA-CIAV-014536 -> Revoking a Issued Certificate

#### SP5-SREQ-1158 -> Wildcard certificates shall not be issued.

- TCA-CIAV-017440 -> No issuance of Wildcard Certificate

#### SP5-SREQ-226 -> The Digital Certificate Services shall be able to issue digital certificates based on the requests from other federation partners.

- TCA-CIAV-017441 -> Federated certificate issuance

#### SP5-SREQ-227 -> The Digital Certificate Services shall be able to issue certificates based on VPN or TLS certificate profile defined in iTIF Certificate Profiles specification

- TCA-CIAV-017452 -> Certificate Issuance based on VPN or TLS Profile

#### SP5-SREQ-233 -> The Digital Certificate Services shall allow to re-key digital certificates which expired during the mission.

- TCA-CIAV-014535 -> Check Re-key in Certificate Renewal

#### SP5-SREQ-292 -> Access to CA and RA shall be limited to privileged users.

- TCA-CIAV-017518 -> Access control to RA / CA

#### SP5-SREQ-293 -> Authentication shall be done in accordance with the Inter-entity Trust Interoperability Framework (ITIF).

- TCA-CIAV-017517 -> Authentication, Secure Log-on and Events Logging as per ITIF

#### SP5-SREQ-294 -> Secure log-on procedures shall be implemented as per the ITIF.

- TCA-CIAV-017517 -> Authentication, Secure Log-on and Events Logging as per ITIF

#### SP5-SREQ-295 -> Events shall be logged as documented in the ITIF.

- TCA-CIAV-017517 -> Authentication, Secure Log-on and Events Logging as per ITIF

#### SP5-SREQ-296 -> Private keys transmitted across the network shall be encrypted.

- TCA-CIAV-017441 -> Federated certificate issuance

#### SP5-SREQ-297 -> CRLs and Certificates shall be signed by a trusted CA

- TCA-CIAV-017486 -> CRL and Leaf Certificate Issuer Validation

#### SP5-SREQ-298 -> The RA shall validate certificate requests to ensure correct data entry (at least procedurally)

- TCA-CIAV-014538 -> Generating Certificate Request and Corresponding Certificate

#### SP5-SREQ-546 -> The Digital Certificate Services shall make the root and issuing CA's certificates available through HTTP and provide this URL in issued digital certificates through the AIA extension.

- TCA-CIAV-017478 -> Issuing and Root CA Cert HTTP access through AIA



### SP5-TIN-56 -> Digital Certificate Validation (CRL) Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-012750 -> Communications CRL Distribution Point HTTP

- TCA-CIAV-014506 -> DNS Resolution CRL Distribution Point HTTP

- TCA-CIAV-014511 -> Certificate Revocation List Status HTTP

- TCA-CIAV-014512 -> DNS Resolution AIA HTTP

- TCA-CIAV-014519 -> Authority Information Access HTTP

- TCA-CIAV-014529 -> Authority Information Access HTTP

- TCA-CIAV-016969 -> Validate local geospatial metadata portal HTTPS integration

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-014515 -> Check Consumer Behavior on Revoked Certificate

- TCA-CIAV-014518 -> Check Consumer Behavior on Expired Certificate

- TCA-CIAV-016969 -> Validate local geospatial metadata portal HTTPS integration



### SP5-TIN-56 -> Digital Certificate Validation (CRL) Provider

#### SP5-SREQ-297 -> CRLs and Certificates shall be signed by a trusted CA

- TCA-CIAV-017428 -> NEW - REPO-03505-Transport Layer Security Profile

- TCA-CIAV-017486 -> CRL and Leaf Certificate Issuer Validation

#### SP5-SREQ-548 -> The Digital Certificate Services shall make the revocation status of digital certificates available through an HTTP endpoint accessible from the Mission Network.

- TCA-CIAV-012750 -> Communications CRL Distribution Point HTTP

- TCA-CIAV-014506 -> DNS Resolution CRL Distribution Point HTTP

- TCA-CIAV-014511 -> Certificate Revocation List Status HTTP

- TCA-CIAV-014512 -> DNS Resolution AIA HTTP

- TCA-CIAV-014519 -> Authority Information Access HTTP

- TCA-CIAV-014529 -> Authority Information Access HTTP

- TCA-CIAV-014530 -> Communications AIA HTTP

- TCA-CIAV-014532 -> Certificate Revocation List Status HTTP

- TCA-CIAV-014537 -> DNS Resolution CRL Distribution Point HTTP

- TCA-CIAV-014539 -> Communications CRL Distribution Point HTTP

- TCA-CIAV-017428 -> NEW - REPO-03505-Transport Layer Security Profile

#### SP5-SREQ-679 -> Certificate revocation information shall be made available in a high availability mode to avoid single point of failure

- TCA-CIAV-017428 -> NEW - REPO-03505-Transport Layer Security Profile

- TCA-CIAV-017507 -> Certificate Revocation High Availability



### SP5-TIN-57 -> Digital Certificate Validation (OCSP) Consumer

#### SP5-SREQ-1032 -> OCSP responders shall accept requests with nonces.

- TCA-CIAV-017435 -> Verify OCSP Nonce

#### SP5-SREQ-1033 -> OCSP responders shall accept requests without nonces.

- TCA-CIAV-017435 -> Verify OCSP Nonce

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-014517 -> Certificate Revocation Status OCSP

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-014515 -> Check Consumer Behavior on Revoked Certificate

- TCA-CIAV-014518 -> Check Consumer Behavior on Expired Certificate



### SP5-TIN-57 -> Digital Certificate Validation (OCSP) Provider

#### SP5-SREQ-1032 -> OCSP responders shall accept requests with nonces.

- TCA-CIAV-017422 -> Verify Certificate Revocation Status OCSP Nonce

- TCA-CIAV-017435 -> Verify OCSP Nonce

#### SP5-SREQ-1033 -> OCSP responders shall accept requests without nonces.

- TCA-CIAV-017422 -> Verify Certificate Revocation Status OCSP Nonce

- TCA-CIAV-017435 -> Verify OCSP Nonce

#### SP5-SREQ-229 -> The Digital Certificate Services shall make revocation status of digital certificates available through OCSP endpoints.

- TCA-CIAV-014517 -> Certificate Revocation Status OCSP

- TCA-CIAV-014531 -> Certificate Revocation Status OCSP

- TCA-CIAV-017422 -> Verify Certificate Revocation Status OCSP Nonce

- TCA-CIAV-017435 -> Verify OCSP Nonce

#### SP5-SREQ-297 -> CRLs and Certificates shall be signed by a trusted CA

- TCA-CIAV-014534 -> DNS Resolution OCSP

- TCA-CIAV-017486 -> CRL and Leaf Certificate Issuer Validation

#### SP5-SREQ-679 -> Certificate revocation information shall be made available in a high availability mode to avoid single point of failure

- TCA-CIAV-017507 -> Certificate Revocation High Availability



## SP5-SI-SMC -> Service Management and Control

### SP5-TIN-225 -> Service Catalogue Management API Collaborator

#### SP5-SREQ-1036 -> The SRCM service shall enable MNPs to query a single or multiple elements of a Service Request Catalogue from Service Providers.

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1086 -> The SMC service shall enable the federated exchange of MN Services via standardized interfaces.

- TCA-CIAV-016780 -> Spiral 5 - SMC - SCM - Create Service

- TCA-CIAV-016781 -> Spiral 5 - SMC - SCM - Update Service

- TCA-CIAV-016784 -> Spiral 5 - SMC - SCM - List Services

- TCA-CIAV-016785 -> Spiral 5 - SMC - SCM - Register Service Catalogue Listener

- TCA-CIAV-016786 -> Spiral 5 - SMC - SCM - Unregister Service Catalogue Listener

- TCA-CIAV-016815 -> Spiral 5 - SMC - SCM - List Service Instances

- TCA-CIAV-016869 -> Execute SMC API Verification (SCM.TIN)

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1087 -> The Service Catalogue Management service shall enable MNPs to query a single or multiple MN Services from Service Providers.

- TCA-CIAV-016784 -> Spiral 5 - SMC - SCM - List Services

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1088 -> The Service Catalogue Management service shall enable MNPs to subscribe to Service notifications from Service Providers.

- TCA-CIAV-016785 -> Spiral 5 - SMC - SCM - Register Service Catalogue Listener

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1089 -> The Service Catalogue Management service shall enable MNPs to unsubscribe to Service notifications from Service Providers.

- TCA-CIAV-016786 -> Spiral 5 - SMC - SCM - Unregister Service Catalogue Listener

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1090 -> The Service Catalogue Management service shall enable Service Providers to send life-cycle information about MN Services to interested MNPs.

- TCA-CIAV-016780 -> Spiral 5 - SMC - SCM - Create Service

- TCA-CIAV-016781 -> Spiral 5 - SMC - SCM - Update Service

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1162 -> The Service Catalogue Management service shall enable MNPs to query a single or multiple Service Instances from Service Providers.

- TCA-CIAV-016815 -> Spiral 5 - SMC - SCM - List Service Instances

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016780 -> Spiral 5 - SMC - SCM - Create Service

- TCA-CIAV-016781 -> Spiral 5 - SMC - SCM - Update Service

- TCA-CIAV-016784 -> Spiral 5 - SMC - SCM - List Services

- TCA-CIAV-016785 -> Spiral 5 - SMC - SCM - Register Service Catalogue Listener

- TCA-CIAV-016786 -> Spiral 5 - SMC - SCM - Unregister Service Catalogue Listener

- TCA-CIAV-016815 -> Spiral 5 - SMC - SCM - List Service Instances

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



### SP5-TIN-226 -> Incident Management API Collaborator

#### SP5-SREQ-1077 -> The SMC service shall enable the federated exchange of Incidents via standardized interfaces.

- TCA-CIAV-016765 -> Spiral 5 - SMC - INC - Create Incident

- TCA-CIAV-016766 -> Spiral 5 - SMC - INC - Patch Incident

- TCA-CIAV-016767 -> Spiral 5 - SMC - INC - List Incidents

- TCA-CIAV-016769 -> Spiral 5 - SMC - INC - Add Note to Incident

- TCA-CIAV-016770 -> Spiral 5 - SMC - INC - Add Attachment to Incident

- TCA-CIAV-016771 -> Spiral 5 - SMC - INC - Register Incident Listener

- TCA-CIAV-016772 -> Spiral 5 - SMC - INC - Unregister Incident Listener

- TCA-CIAV-016870 -> Execute SMC API Verification (INC.TIN)

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1078 -> The Incident Management service shall enable Service Consumers to report Incidents to Service Providers.

- TCA-CIAV-016765 -> Spiral 5 - SMC - INC - Create Incident

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1079 -> The Incident Management service shall enable the exchange of Incident updates between Service Consumers and Service Providers.

- TCA-CIAV-016766 -> Spiral 5 - SMC - INC - Patch Incident

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1080 -> The Incident Management service shall enable MNPs to query the current status of a single or multiple Incidents from Service Providers.

- TCA-CIAV-016767 -> Spiral 5 - SMC - INC - List Incidents

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1081 -> The Incident Management Service shall enable Service Consumers and Service Providers to exchange additional information or knowledge that assists in the analysis and resolution of an Incident.

- TCA-CIAV-016769 -> Spiral 5 - SMC - INC - Add Note to Incident

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1082 -> The Incident Management service shall enable the exchange of supporting documents for an existing Incident between Service Providers and Service Consumers.

- TCA-CIAV-016770 -> Spiral 5 - SMC - INC - Add Attachment to Incident

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1083 -> The Incident Management service shall enable MNPs to subscribe to Incident lifecycle notifications from Service Providers.

- TCA-CIAV-016771 -> Spiral 5 - SMC - INC - Register Incident Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1084 -> The Incident Management service shall enable MNPs to unsubscribe to Incident lifecycle notifications from Service Providers.

- TCA-CIAV-016772 -> Spiral 5 - SMC - INC - Unregister Incident Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1085 -> The Incident Management service shall enable Service Providers to inform interested MNPs about the current status of incidents.

- TCA-CIAV-016765 -> Spiral 5 - SMC - INC - Create Incident

- TCA-CIAV-016766 -> Spiral 5 - SMC - INC - Patch Incident

- TCA-CIAV-016769 -> Spiral 5 - SMC - INC - Add Note to Incident

- TCA-CIAV-016770 -> Spiral 5 - SMC - INC - Add Attachment to Incident

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016765 -> Spiral 5 - SMC - INC - Create Incident

- TCA-CIAV-016766 -> Spiral 5 - SMC - INC - Patch Incident

- TCA-CIAV-016767 -> Spiral 5 - SMC - INC - List Incidents

- TCA-CIAV-016769 -> Spiral 5 - SMC - INC - Add Note to Incident

- TCA-CIAV-016770 -> Spiral 5 - SMC - INC - Add Attachment to Incident

- TCA-CIAV-016771 -> Spiral 5 - SMC - INC - Register Incident Listener

- TCA-CIAV-016772 -> Spiral 5 - SMC - INC - Unregister Incident Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



### SP5-TIN-227 -> Change Management API Collaborator

#### SP5-SREQ-1051 -> The SMC service shall enable the federated exchange of Changes via standardized interfaces.

- TCA-CIAV-016802 -> Spiral 5 - SMC - CHG - Create Change

- TCA-CIAV-016803 -> Spiral 5 - SMC - CHG - Patch Change

- TCA-CIAV-016804 -> Spiral 5 - SMC - CHG - List Changes

- TCA-CIAV-016805 -> Spiral 5 - SMC - CHG - Add Note to Change

- TCA-CIAV-016806 -> Spiral 5 - SMC - CHG - Add Attachment to Change

- TCA-CIAV-016807 -> Spiral 5 - SMC - CHG - Register Change Listener

- TCA-CIAV-016808 -> Spiral 5 - SMC - CHG - Unregister Change Listener

- TCA-CIAV-016875 -> Execute SMC API Verification (CHG.TIN)

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1052 -> The Change Management service shall enable Service Providers to notify the CSE of Request for Change and vice versa.

- TCA-CIAV-016802 -> Spiral 5 - SMC - CHG - Create Change

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1053 -> The Change Management service shall enable the exchange of Change updates between Service Providers and the CSE.

- TCA-CIAV-016803 -> Spiral 5 - SMC - CHG - Patch Change

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1054 -> The Change Management service shall enable MNPs to query the current status of a single or multiple RfCs or Changes from Service Providers.

- TCA-CIAV-016804 -> Spiral 5 - SMC - CHG - List Changes

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1055 -> The Change Management Service shall enable the CSE and Service Providers to exchange additional information or knowledge that assists in the analysis and execution of a Change.

- TCA-CIAV-016805 -> Spiral 5 - SMC - CHG - Add Note to Change

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1056 -> The Change Management service shall enable the exchange of supporting documents for an existing Change between Service Providers and the CSE.

- TCA-CIAV-016806 -> Spiral 5 - SMC - CHG - Add Attachment to Change

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1057 -> The Change Management service shall enable MNPs to subscribe to Change lifecycle notifications from Service Providers.

- TCA-CIAV-016807 -> Spiral 5 - SMC - CHG - Register Change Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1058 -> The Change Management service shall enable MNPs to unsubscribe to Change lifecycle notifications from Service Providers.

- TCA-CIAV-016808 -> Spiral 5 - SMC - CHG - Unregister Change Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1059 -> The Change Management service shall enable Service Providers to inform interested MNPs about the current status of Changes.

- TCA-CIAV-016802 -> Spiral 5 - SMC - CHG - Create Change

- TCA-CIAV-016803 -> Spiral 5 - SMC - CHG - Patch Change

- TCA-CIAV-016805 -> Spiral 5 - SMC - CHG - Add Note to Change

- TCA-CIAV-016806 -> Spiral 5 - SMC - CHG - Add Attachment to Change

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016802 -> Spiral 5 - SMC - CHG - Create Change

- TCA-CIAV-016803 -> Spiral 5 - SMC - CHG - Patch Change

- TCA-CIAV-016804 -> Spiral 5 - SMC - CHG - List Changes

- TCA-CIAV-016805 -> Spiral 5 - SMC - CHG - Add Note to Change

- TCA-CIAV-016806 -> Spiral 5 - SMC - CHG - Add Attachment to Change

- TCA-CIAV-016807 -> Spiral 5 - SMC - CHG - Register Change Listener

- TCA-CIAV-016808 -> Spiral 5 - SMC - CHG - Unregister Change Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



### SP5-TIN-228 -> Request Fulfilment API Collaborator

#### SP5-SREQ-1072 -> The SMC service shall enable the federated exchange of Service Requests and Access Requests via standardized interfaces.

- TCA-CIAV-016787 -> Spiral 5 - SMC - SRQ - Add Note to Service Request

- TCA-CIAV-016788 -> Spiral 5 - SMC - SRQ - List Service Requests

- TCA-CIAV-016789 -> Spiral 5 - SMC - SRQ - Patch Service Request

- TCA-CIAV-016790 -> Spiral 5 - SMC - SRQ - Create Service Request

- TCA-CIAV-016872 -> Execute SMC API Verification (SRQ.TIN)

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1073 -> The Request Fulfilment service shall enable MNPs to raise a Request for a specific Service at the Service Provider.

- TCA-CIAV-016790 -> Spiral 5 - SMC - SRQ - Create Service Request

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1074 -> The Request Fulfilment service shall enable the exchange of Service Request and Access Request updates between Service Consumers and Service Providers.

- TCA-CIAV-016789 -> Spiral 5 - SMC - SRQ - Patch Service Request

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1075 -> The Request Fulfilment service shall enable MNPs to query the current status of a single or multiple Service Requests or Access Requests from Service Providers.

- TCA-CIAV-016788 -> Spiral 5 - SMC - SRQ - List Service Requests

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1076 -> The Request Fulfilment service shall enable Service Consumers and Service Providers to exchange additional information or knowledge that assists in the analysis and fulfilment of a Service Request or Access Request.

- TCA-CIAV-016787 -> Spiral 5 - SMC - SRQ - Add Note to Service Request

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016787 -> Spiral 5 - SMC - SRQ - Add Note to Service Request

- TCA-CIAV-016788 -> Spiral 5 - SMC - SRQ - List Service Requests

- TCA-CIAV-016789 -> Spiral 5 - SMC - SRQ - Patch Service Request

- TCA-CIAV-016790 -> Spiral 5 - SMC - SRQ - Create Service Request

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



### SP5-TIN-229 -> Service Asset and Configuration Management API Collaborator

#### SP5-SREQ-1060 -> The SMC service shall enable the federated exchange of Federated Configuration Items via standardized interfaces.

- TCA-CIAV-016796 -> Spiral 5 - SMC - FCI - Create Federated CI

- TCA-CIAV-016797 -> Spiral 5 - SMC - FCI - Update Federated CI

- TCA-CIAV-016798 -> Spiral 5 - SMC - FCI - Unregister SACM Listener

- TCA-CIAV-016799 -> Spiral 5 - SMC - FCI - Register SACM Listener

- TCA-CIAV-016800 -> Spiral 5 - SMC - FCI - List Federated CIs

- TCA-CIAV-016874 -> Execute SMC API Verification (FCI.TIN)

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1061 -> The Service Asset and Configuration Management service shall enable MNPs to query a single or multiple Federated CIs from Service Providers.

- TCA-CIAV-016800 -> Spiral 5 - SMC - FCI - List Federated CIs

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1062 -> The Service Asset and Configuration Management service shall enable Service Consumers to subscribe to Federated CI notifications from Service Providers.

- TCA-CIAV-016799 -> Spiral 5 - SMC - FCI - Register SACM Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1063 -> The Service Asset and Configuration Management service shall enable MNPs to unsubscribe to Federated CI notifications from Service Providers.

- TCA-CIAV-016798 -> Spiral 5 - SMC - FCI - Unregister SACM Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1064 -> The Service Asset and Configuration Management service shall enable Service Providers to send life-cycle information about Federated CIs to interested MNPs.

- TCA-CIAV-016796 -> Spiral 5 - SMC - FCI - Create Federated CI

- TCA-CIAV-016797 -> Spiral 5 - SMC - FCI - Update Federated CI

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016796 -> Spiral 5 - SMC - FCI - Create Federated CI

- TCA-CIAV-016797 -> Spiral 5 - SMC - FCI - Update Federated CI

- TCA-CIAV-016798 -> Spiral 5 - SMC - FCI - Unregister SACM Listener

- TCA-CIAV-016799 -> Spiral 5 - SMC - FCI - Register SACM Listener

- TCA-CIAV-016800 -> Spiral 5 - SMC - FCI - List Federated CIs

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



### SP5-TIN-230 -> Event Management API Collaborator

#### SP5-SREQ-1065 -> The SMC service shall enable the federated exchange of Events via standardized interfaces.

- TCA-CIAV-016791 -> Spiral 5 - SMC - EVT - Create Event

- TCA-CIAV-016792 -> Spiral 5 - SMC - EVT - Patch Event

- TCA-CIAV-016793 -> Spiral 5 - SMC - EVT - List Events

- TCA-CIAV-016794 -> Spiral 5 - SMC - EVT - Register Event Listener

- TCA-CIAV-016795 -> Spiral 5 - SMC - EVT - Unregister Event Listener

- TCA-CIAV-016873 -> Execute SMC API Verification (EVT.TIN)

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1066 -> The Event Management service shall enable Service Customers to report Events to Service Providers.

- TCA-CIAV-016791 -> Spiral 5 - SMC - EVT - Create Event

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1067 -> The Event Management service shall enable the exchange of Event updates between Service Consumers and Service Providers.

- TCA-CIAV-016792 -> Spiral 5 - SMC - EVT - Patch Event

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1068 -> The Event Management service shall enable MNPs to query the current status of a single or multiple Events from Service Providers

- TCA-CIAV-016793 -> Spiral 5 - SMC - EVT - List Events

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1069 -> The Event Management service shall enable MNPs to subscribe to Event lifecycle notifications from Service Providers.

- TCA-CIAV-016794 -> Spiral 5 - SMC - EVT - Register Event Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1070 -> The Event Management service shall enable MNPs to unsubscribe to Event lifecycle notifications from Service Providers.

- TCA-CIAV-016795 -> Spiral 5 - SMC - EVT - Unregister Event Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1071 -> The Event Management service shall enable Service Providers to inform interested MNPs about the current status of Events.

- TCA-CIAV-016791 -> Spiral 5 - SMC - EVT - Create Event

- TCA-CIAV-016792 -> Spiral 5 - SMC - EVT - Patch Event

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016791 -> Spiral 5 - SMC - EVT - Create Event

- TCA-CIAV-016792 -> Spiral 5 - SMC - EVT - Patch Event

- TCA-CIAV-016793 -> Spiral 5 - SMC - EVT - List Events

- TCA-CIAV-016794 -> Spiral 5 - SMC - EVT - Register Event Listener

- TCA-CIAV-016795 -> Spiral 5 - SMC - EVT - Unregister Event Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



### SP5-TIN-232 -> Location Management API Collaborator

#### SP5-SREQ-1046 -> The SMC service shall enable the federated exchange of Geographic Locations via standardized interfaces.

- TCA-CIAV-016773 -> Spiral 5 - SMC - GEO - Update Geographic Location

- TCA-CIAV-016774 -> Spiral 5 - SMC - GEO - Unregister Geographic Location Listener

- TCA-CIAV-016775 -> Spiral 5 - SMC - GEO - Register Geographic Location Listener

- TCA-CIAV-016776 -> Spiral 5 - SMC - GEO - List Geographic Locations

- TCA-CIAV-016801 -> Spiral 5 - SMC - GEO - Create Geographic Location

- TCA-CIAV-016876 -> Execute SMC API Verification (GEO.TIN)

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1047 -> The Geographic Location Management service shall enable MNPs to query a single or multiple geographic elements such as Addresses, Sites or Locations  from Service Providers.

- TCA-CIAV-016776 -> Spiral 5 - SMC - GEO - List Geographic Locations

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1048 -> The Geographic Location Management service shall enable Service Consumers to subscribe to Geographic Location notifications from Service Providers.

- TCA-CIAV-016775 -> Spiral 5 - SMC - GEO - Register Geographic Location Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1049 -> The Geographic Location Management service shall enable MNPs to unsubscribe to Geographic Location notifications from Service Providers.

- TCA-CIAV-016774 -> Spiral 5 - SMC - GEO - Unregister Geographic Location Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1050 -> The Geographic Location Management service shall enable Service Providers to send life-cycle information about elements of the Geographic Location Management to interested MNPs.

- TCA-CIAV-016773 -> Spiral 5 - SMC - GEO - Update Geographic Location

- TCA-CIAV-016801 -> Spiral 5 - SMC - GEO - Create Geographic Location

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016773 -> Spiral 5 - SMC - GEO - Update Geographic Location

- TCA-CIAV-016774 -> Spiral 5 - SMC - GEO - Unregister Geographic Location Listener

- TCA-CIAV-016775 -> Spiral 5 - SMC - GEO - Register Geographic Location Listener

- TCA-CIAV-016776 -> Spiral 5 - SMC - GEO - List Geographic Locations

- TCA-CIAV-016801 -> Spiral 5 - SMC - GEO - Create Geographic Location

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



### SP5-TIN-325 -> Service Request Catalogue Management API Collaborator

#### SP5-SREQ-1037 -> The SRCM service shall enable MNPs to query a single or multiple elements of a Service Request Catalogue from Service Providers.

- TCA-CIAV-016809 -> Spiral 5 - SMC - SRC - List Service Request Catalogues

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1038 -> The SRCM service shall enable Service Consumers to subscribe to Service Request Catalogue notifications from Service Providers.

- TCA-CIAV-016810 -> Spiral 5 - SMC - SRC - Register Service Request Catalogue Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1039 -> The SRCM service shall enable MNPs to unsubscribe to Service Request Catalogue notifications from Service Providers.

- TCA-CIAV-016811 -> Spiral 5 - SMC - SRC - Unregister Service Request Catalogue Listener

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1040 -> The SRCM service shall enable Service Providers to send life-cycle information about elements of the Service Request Catalogue to interested MNPs.

- TCA-CIAV-016812 -> Spiral 5 - SMC - SRC - Create Service Request Catalogue

- TCA-CIAV-016813 -> Spiral 5 - SMC - SRC - Update Service Request Catalogue

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services

#### SP5-SREQ-1295 -> TLS shall be used by Federated SCM APIs

- TCA-CIAV-016809 -> Spiral 5 - SMC - SRC - List Service Request Catalogues

- TCA-CIAV-016810 -> Spiral 5 - SMC - SRC - Register Service Request Catalogue Listener

- TCA-CIAV-016811 -> Spiral 5 - SMC - SRC - Unregister Service Request Catalogue Listener

- TCA-CIAV-016812 -> Spiral 5 - SMC - SRC - Create Service Request Catalogue

- TCA-CIAV-016813 -> Spiral 5 - SMC - SRC - Update Service Request Catalogue

- TCA-CIAV-017244 -> Spiral 5 - SMC - Access Remote Services

- TCA-CIAV-017246 -> Spiral 5 - SMC - Check remote DNS

- TCA-CIAV-017249 -> Spiral 5 - SMC - Check local DNS

- TCA-CIAV-017255 -> Spiral 5 - SMC - Access Local Services



## SP5-SI-VP -> Virtualized Processing

### SP5-TIN-15 -> Virtual Machine Hosting Consumer

#### SP5-SREQ-1284 -> The service consumer shall be able to provide virtual machine images in accordance with the virtual appliance interchange profile to the service provider.

- TCA-CIAV-014545 -> Export VM into OVF

#### SP5-SREQ-787 -> The Service Consumer shall calculate the checksum of the VM to be imported.

- TCA-CIAV-014544 -> Create checksum of the OVF

#### SP5-SREQ-798 -> The Service Consumer shall ensure compliance of provided VMs with security requirements mutually agreed with Service Provider.

- TCA-CIAV-014545 -> Export VM into OVF



### SP5-TIN-15 -> Virtual Machine Hosting Provider

#### SP5-SREQ-69 -> Events shall be logged at the hypervisor level by the Service Provider.

- TCA-CIAV-014556 -> Logging of events

#### SP5-SREQ-70 -> Event logs must include, when relevant: events details such as: powering and deployment of VMs, and alarms, including name and description, alarm type, triggers, tolerance thresholds and actions.

- TCA-CIAV-014556 -> Logging of events

#### SP5-SREQ-72 -> Virtualized network provided to the Service Consumer shall be protected to the same levels as per FMN network security as captured in the SI for Communications and the SI for CIS Security.

#### SP5-SREQ-797 -> The Service Provider shall validate the checksum before importing the VM.

- TCA-CIAV-014546 -> Deploy VM from OVF

#### SP5-SREQ-799 -> The Service Provider shall be able to import virtual machine images in accordance with the virtual appliance interchange profile

- TCA-CIAV-014546 -> Deploy VM from OVF



### SP5-TIN-16 -> Virtual Machine Management Consumer

#### SP5-SREQ-1283 -> The service consumer shall be able to monitor and manage their own VMs using the VM managament interface provided by the service provider

- TCA-CIAV-014547 -> Resource Monitoring

- TCA-CIAV-014556 -> Logging of events

- TCA-CIAV-014559 -> Test to access the VM remotly

- TCA-CIAV-014560 -> Test accessibility of the services that are hosted in the VM

- TCA-CIAV-016881 -> Test to access the Management interface

- TCA-CIAV-017081 -> Assign the necessary rights for the service consumer



### SP5-TIN-16 -> Virtual Machine Management Provider

#### SP5-SREQ-312 -> Event logs must include, when relevant: user access to the administrative interface; VM power on/off; and configuration changes to the VM.

- TCA-CIAV-014556 -> Logging of events

#### SP5-SREQ-68 -> Access to VM Management shall be limited to the service consumer administrator.

- TCA-CIAV-014559 -> Test to access the VM remotly

- TCA-CIAV-016881 -> Test to access the Management interface

- TCA-CIAV-017081 -> Assign the necessary rights for the service consumer

#### SP5-SREQ-69 -> Events shall be logged at the hypervisor level by the Service Provider.

- TCA-CIAV-014556 -> Logging of events

#### SP5-SREQ-802 -> The Service Provider shall allow Service Consumer to monitor resources allocated to the Service Consumer.

- TCA-CIAV-016881 -> Test to access the Management interface

- TCA-CIAV-017081 -> Assign the necessary rights for the service consumer

#### SP5-SREQ-803 -> The Service provider shall provide the Service Consumer with remote access to the virtual console (e.g. keyboard, mouse, screen) of the imported VM.

- TCA-CIAV-014559 -> Test to access the VM remotly

- TCA-CIAV-014560 -> Test accessibility of the services that are hosted in the VM

- TCA-CIAV-016881 -> Test to access the Management interface

- TCA-CIAV-017081 -> Assign the necessary rights for the service consumer



## SP5-SI-WEBAUTH -> Web Authentication

### SP5-TIN-64 -> Web Authentication Consumer

#### SP5-SREQ-176 -> The Relying Party shall be able to handle encrypted tokens.

- TCA-CIAV-012703 -> OLD - Response Tokens shall be encrypted (Browser Compatibility)

- TCA-CIAV-017344 -> 4.64.2 - Inspect the Security Token with encrypted claims

- TCA-CIAV-017344 -> Inspect the Security Token with encrypted claims

#### SP5-SREQ-177 -> The Identity Provider and Relying Party shall use HTTP redirection to redirect the client's browser.

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-017346 -> 4.64.3 - MNP Identify Provider must do Certificate Validation

- TCA-CIAV-017346 -> MNP Identify Provider must do Certificate Validation

#### SP5-SREQ-307 -> The Relying Party shall validate digitally signed security tokens.

- TCA-CIAV-012705 -> OLD - Claims Provider shall digitally sign the security tokens.

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata

#### SP5-SREQ-308 -> Event logs shall include, as a minimum records of successful and rejected authentication attempts.

- TCA-CIAV-017347 -> 4.64.4 - MNP Identity Provider must log authentication attepts

#### SP5-SREQ-606 -> The Relying Party shall be able to consume Security Assertion Markup Language (SAML) 2.0 security tokens.

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata

#### SP5-SREQ-74 -> Communications between Service Consumer and Web Application/Relying Party; or Service Consumer and Identity Provider, shall be done via HTTPS.

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata



### SP5-TIN-64 -> Web Authentication Provider

#### SP5-SREQ-168 -> The Identity Provider shall issue security tokens based on the Security Assertion Markup Language (SAML) 2.0.

- TCA-CIAV-012695 -> OLD - Security token contains Unique Identifier. (ADFS)

- TCA-CIAV-012698 -> OLD - The Claims Provider shall support the IdP lite and SP lite operational modes

- TCA-CIAV-012701 -> OLD - Claims Providers must use the SAML 2.0 standard

- TCA-CIAV-012935 -> OLD - The Claims Provider shall support the IdP lite and SP lite operational modes

- TCA-CIAV-012937 -> OLD - Claims Providers must use the SAML 2.0 standard

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017326 -> 1.64.1 - Verify that the Identity Provider (IdP) support the SAML 2.0 standard

- TCA-CIAV-017326 -> NEW - Verify that the Identity Provider (IdP) support the SAML 2.0 standard

- TCA-CIAV-017326 -> Verify that the Identity Provider (IdP) support the SAML 2.0 standard

- TCA-CIAV-017327 -> 1.64.2 - Verify the Joining and Exiting Mission Instruction (JMEI) from SMA

- TCA-CIAV-017327 -> NEW - Verify the Joining and Exiting Mission Instruction (JMEI) from SMA

- TCA-CIAV-017327 -> Verify the Joining and Exiting Mission Instruction (JMEI) from SMA

- TCA-CIAV-017333 -> 2.64.7 - Local Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017333 -> Local Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata

#### SP5-SREQ-169 -> The Identity Provider shall provide security tokens to the Relying Party.

- TCA-CIAV-012712 -> OLD - The Source Claims Provider shall provide Security Tokens to the Target Claims Provider

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017345 -> 4.64.1 - Authentication end-to-end

- TCA-CIAV-017345 -> Authentication end-to-end

#### SP5-SREQ-171 -> The Identity Provider shall include attributes from its local attribute store in the security token.

- TCA-CIAV-012690 -> OLD - Configure Local Attribute Store (ADFS)

- TCA-CIAV-012697 -> OLD - Incoming claims can be updated with local attributes (ADFS)

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017336 -> 2.64.6 - Local Identity Provider (IdP) must add claims from local attribute store

- TCA-CIAV-017336 -> Local Identity Provider (IdP) must add claims from local attribute store

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

#### SP5-SREQ-174 -> All Tokens shall include an AudienceRestriction element to prevent wide-spread reuse of a single token

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

#### SP5-SREQ-175 -> The Identity Provider shall digitally sign the security tokens.

- TCA-CIAV-012705 -> OLD - Claims Provider shall digitally sign the security tokens.

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017333 -> 2.64.7 - Local Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017333 -> Local Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata

#### SP5-SREQ-177 -> The Identity Provider and Relying Party shall use HTTP redirection to redirect the client's browser.

- TCA-CIAV-012687 -> OLD - HTTPS Redirection

- TCA-CIAV-012713 -> OLD - HTTPS Redirection

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017333 -> 2.64.7 - Local Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017333 -> Local Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-012688 -> OLD - Certificate signed by trusted CA for Claims Provider Trust

- TCA-CIAV-012711 -> OLD - Certificate signed by trusted CA for IdP Trust

- TCA-CIAV-017346 -> 4.64.3 - MNP Identify Provider must do Certificate Validation

- TCA-CIAV-017346 -> MNP Identify Provider must do Certificate Validation

#### SP5-SREQ-308 -> Event logs shall include, as a minimum records of successful and rejected authentication attempts.

- TCA-CIAV-012693 -> OLD - Check persistent log web auth

- TCA-CIAV-017334 -> 2.64.8 - Local Identity Provider (IdP) must log authentication attempts

- TCA-CIAV-017334 -> Local Identity Provider (IdP) must log authentication attempts

- TCA-CIAV-017347 -> 4.64.4 - MNP Identity Provider must log authentication attepts

#### SP5-SREQ-71 -> Events shall be logged by the MNP domain identity management solution and by the service.

- TCA-CIAV-012693 -> OLD - Check persistent log web auth

- TCA-CIAV-017334 -> 2.64.8 - Local Identity Provider (IdP) must log authentication attempts

- TCA-CIAV-017334 -> Local Identity Provider (IdP) must log authentication attempts

- TCA-CIAV-017347 -> 4.64.4 - MNP Identity Provider must log authentication attepts

#### SP5-SREQ-73 -> Event logs must include, as a minimum: user authentication attempts; and records of issued tokens, such as identification of the Relying Party (url), of Service Consumer (IP address) and the user identifier provided in the token (account attempting to use the service).

- TCA-CIAV-012693 -> OLD - Check persistent log web auth

- TCA-CIAV-017334 -> 2.64.8 - Local Identity Provider (IdP) must log authentication attempts

- TCA-CIAV-017334 -> Local Identity Provider (IdP) must log authentication attempts

- TCA-CIAV-017347 -> 4.64.4 - MNP Identity Provider must log authentication attepts

#### SP5-SREQ-74 -> Communications between Service Consumer and Web Application/Relying Party; or Service Consumer and Identity Provider, shall be done via HTTPS.

- TCA-CIAV-012713 -> OLD - HTTPS Redirection

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017332 ->  Local Identity Provider (IdP) must use HTTPS

- TCA-CIAV-017332 -> 2.64.5 - Local Identity Provider (IdP) must use HTTPS

- TCA-CIAV-017338 -> 3.64.2 - Inspect the Security Token without encrypted claims

- TCA-CIAV-017338 -> Inspect the Security Token without encrypted claims

- TCA-CIAV-017340 -> 3.64.1 - MNP Identity Provider (IdP) Federation Metadata

- TCA-CIAV-017340 -> MNP Identity Provider (IdP) Federation Metadata

#### SP5-SREQ-75 -> Sensitive data passed in SAML tokens shall be encrypted.

- TCA-CIAV-012703 -> OLD - Response Tokens shall be encrypted (Browser Compatibility)

- TCA-CIAV-012993 -> OLD - Authentication end-to-end

- TCA-CIAV-017344 -> 4.64.2 - Inspect the Security Token with encrypted claims

- TCA-CIAV-017344 -> Inspect the Security Token with encrypted claims



### SP5-TIN-65 -> Web Authentication Consumer

#### SP5-SREQ-176 -> The Relying Party shall be able to handle encrypted tokens.

- TCA-CIAV-017349 -> Authentication end-to-end with IdP Broker (Hub)

#### SP5-SREQ-177 -> The Identity Provider and Relying Party shall use HTTP redirection to redirect the client's browser.

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

#### SP5-SREQ-307 -> The Relying Party shall validate digitally signed security tokens.

#### SP5-SREQ-308 -> Event logs shall include, as a minimum records of successful and rejected authentication attempts.

#### SP5-SREQ-606 -> The Relying Party shall be able to consume Security Assertion Markup Language (SAML) 2.0 security tokens.

- TCA-CIAV-017349 -> 4.65.2 - Authentication end-to-end with IdP Broker (Hub)

- TCA-CIAV-017349 -> Authentication end-to-end with IdP Broker (Hub)

#### SP5-SREQ-74 -> Communications between Service Consumer and Web Application/Relying Party; or Service Consumer and Identity Provider, shall be done via HTTPS.



### SP5-TIN-65 -> Web Authentication Brokering Mediator

#### SP5-SREQ-1218 -> The Identity Broker shall fulfill the roles of a Relying Party and an Identity Provider and broker security tokens between federation Identity Providers and Relying Parties.

- TCA-CIAV-017349 -> 4.65.2 - Authentication end-to-end with IdP Broker (Hub)

- TCA-CIAV-017349 -> Authentication end-to-end with IdP Broker (Hub)

- TCA-CIAV-017350 -> 4.65.1 - The IdP Broker (Hub) provides Security Tokens to other Identity Providers

- TCA-CIAV-017350 -> The IdP Broker (Hub) provides Security Tokens to other Identity Providers



### SP5-TIN-65 -> Web Authentication Provider

#### SP5-SREQ-168 -> The Identity Provider shall issue security tokens based on the Security Assertion Markup Language (SAML) 2.0.

- TCA-CIAV-017349 -> 4.65.2 - Authentication end-to-end with IdP Broker (Hub)

- TCA-CIAV-017349 -> Authentication end-to-end with IdP Broker (Hub)

#### SP5-SREQ-169 -> The Identity Provider shall provide security tokens to the Relying Party.

- TCA-CIAV-017349 -> 4.65.2 - Authentication end-to-end with IdP Broker (Hub)

- TCA-CIAV-017349 -> Authentication end-to-end with IdP Broker (Hub)

#### SP5-SREQ-171 -> The Identity Provider shall include attributes from its local attribute store in the security token.

#### SP5-SREQ-174 -> All Tokens shall include an AudienceRestriction element to prevent wide-spread reuse of a single token

#### SP5-SREQ-175 -> The Identity Provider shall digitally sign the security tokens.

#### SP5-SREQ-177 -> The Identity Provider and Relying Party shall use HTTP redirection to redirect the client's browser.

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

#### SP5-SREQ-308 -> Event logs shall include, as a minimum records of successful and rejected authentication attempts.

#### SP5-SREQ-71 -> Events shall be logged by the MNP domain identity management solution and by the service.

#### SP5-SREQ-73 -> Event logs must include, as a minimum: user authentication attempts; and records of issued tokens, such as identification of the Relying Party (url), of Service Consumer (IP address) and the user identifier provided in the token (account attempting to use the service).

#### SP5-SREQ-74 -> Communications between Service Consumer and Web Application/Relying Party; or Service Consumer and Identity Provider, shall be done via HTTPS.

#### SP5-SREQ-75 -> Sensitive data passed in SAML tokens shall be encrypted.



### SP5-TIN-66 -> Web Authentication Trust Establishment Collaborator

#### SP5-SREQ-1161 -> A SAML2.0 entity must set up trust relationships towards other SAML2.0 entities in the federation. The number of required trusts depends on the used topology.

- TCA-CIAV-017341 -> 3.66.2 - Etablish Identity Provider (IdP) Federation Trust

- TCA-CIAV-017341 -> Etablish Identity Provider (IdP) Federation Trust

- TCA-CIAV-017342 -> 5.66.1 - Remove Identity Provider (IdP) Federation Trust

- TCA-CIAV-017342 -> Remove Identity Provider (IdP) Federation Trust



## SP5-SI-WEBHOST -> Web Hosting

### SP5-TIN-10 -> Content Syndication (Web Feeds) Consumer

#### SP5-SREQ-408 -> The Web Hosting Services clients shall be able to consume provided web feeds.

- TCA-CIAV-012878 -> Web Hosting Profile: Web Feeds profiles (GEO RSS)

- TCA-CIAV-017442 -> Web Hosting Profile: Web Feeds profiles - SP5

- TCA-CIAV-017443 -> Web Hosting Profile: Web Feeds profiles (GEO RSS)



### SP5-TIN-10 -> Content Syndication (Web Feeds) Provider

#### SP5-SREQ-407 -> The Web Hosting Services shall support exposing of web feeds

- TCA-CIAV-012878 -> Web Hosting Profile: Web Feeds profiles (GEO RSS)

- TCA-CIAV-017442 -> Web Hosting Profile: Web Feeds profiles - SP5

- TCA-CIAV-017443 -> Web Hosting Profile: Web Feeds profiles (GEO RSS)



### SP5-TIN-7 -> Web-based Content Hosting Consumer

#### SP5-SREQ-230 -> Federated services consuming digital certificates (relying parties) shall perform certificate validation. Certificate validation shall include checking at least: full certificate path validation, certificate validity period and certificate revocation status.

- TCA-CIAV-014555 -> HTTPS Protocol for Web Hosting Services - SP5

- TCA-CIAV-014555 -> HTTPS Protocol for Web Hosting Services - SP5 

- TCA-CIAV-014566 -> Web Platform Profiles - SP5

- TCA-CIAV-017431 -> HTTPS Protocol for Web Hosting Services - SP5

#### SP5-SREQ-311 -> If web content or documents carry security labels, the labels shall be displayed to the user.

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5 

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-402 -> Web Browsers shall be able to consume and present formatted web content to the user.

- TCA-CIAV-014563 -> Web Hosting Profile: Web Content Profile - SP5

- TCA-CIAV-014563 -> Web Hosting Profile: Web Content Profile - SP5 

- TCA-CIAV-014564 -> Web Hosting Profile: Encoding Profiles - SP5

- TCA-CIAV-014564 -> Web Hosting Profile: Encoding Profiles - SP5 

- TCA-CIAV-014566 -> Web Platform Profiles - SP5 

- TCA-CIAV-014567 -> Read/Write access to portal - SP5

- TCA-CIAV-016972 -> Consumer - Check remote portal communications

- TCA-CIAV-017432 -> Protection of information - SP5 

- TCA-CIAV-017433 -> Read/Write access to portal - SP5

#### SP5-SREQ-406 -> Web Browsers shall be able to consume provided files.

- TCA-CIAV-014567 -> Read/Write access to portal - SP5

- TCA-CIAV-016972 -> Consumer - Check remote portal communications

- TCA-CIAV-017432 -> Protection of information - SP5 

- TCA-CIAV-017433 -> Read/Write access to portal - SP5

#### SP5-SREQ-421 -> The service operator shall be notified when the verification of digital certificates fails.

- TCA-CIAV-017431 -> HTTPS Protocol for Web Hosting Services - SP5

#### SP5-SREQ-83 -> Clients shall validate the web hosting service certificates and block the connection for invalid certificates.

- TCA-CIAV-014555 -> HTTPS Protocol for Web Hosting Services - SP5

- TCA-CIAV-014555 -> HTTPS Protocol for Web Hosting Services - SP5 

- TCA-CIAV-014566 -> Web Platform Profiles - SP5

- TCA-CIAV-017431 -> HTTPS Protocol for Web Hosting Services - SP5



### SP5-TIN-7 -> Web-based Content Hosting Provider

#### SP5-SREQ-1270 -> Information Management Roles shall apply STANAG 4774/4778 for security labelling/binding of information

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-1273 -> Security markings shall be applied to all documents provided to users via Web Hosting Services.

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5 

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-32 -> Web hosting services shall have the ability to control access to information based on the identity of the user in accordance with the access control policy.

- TCA-CIAV-017432 -> Protection of information - SP5 

- TCA-CIAV-017433 -> Read/Write access to portal - SP5

#### SP5-SREQ-401 -> The Web Hosting Services shall support sharing of web content (web pages, code, stylesheets).

- TCA-CIAV-014563 -> Web Hosting Profile: Web Content Profile - SP5

- TCA-CIAV-014563 -> Web Hosting Profile: Web Content Profile - SP5 

- TCA-CIAV-014564 -> Web Hosting Profile: Encoding Profiles - SP5

- TCA-CIAV-014564 -> Web Hosting Profile: Encoding Profiles - SP5 

- TCA-CIAV-014567 -> Read/Write access to portal - SP5

- TCA-CIAV-016972 -> Consumer - Check remote portal communications

- TCA-CIAV-017432 -> Protection of information - SP5 

#### SP5-SREQ-405 -> The Web Hosting Services shall support sharing of files

- TCA-CIAV-014567 -> Read/Write access to portal - SP5

- TCA-CIAV-016972 -> Consumer - Check remote portal communications

- TCA-CIAV-017432 -> Protection of information - SP5 

#### SP5-SREQ-413 -> Security markings shall be applied to all web content.

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5 

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-81 -> Web Hosting Services shall log at least: user identifier; system activities; dates, times and details of key events; source and target IP addresses and protocol; user access attempts; and records of successful and rejected data and other resource access attempts.

- TCA-CIAV-014453 -> Logging of events within the portal - SP5

- TCA-CIAV-014453 -> Logging of events within the portal - SP5 



### SP5-TIN-9 -> Web-based Collaboration Consumer

#### SP5-SREQ-1269 -> Information Management Roles shall apply minimum metadata profile based on STANAG 5636

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-402 -> Web Browsers shall be able to consume and present formatted web content to the user.

- TCA-CIAV-014566 -> Web Platform Profiles - SP5 

- TCA-CIAV-014567 -> Read/Write access to portal - SP5

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017257 -> Written Directives Fragmentary Order (FRAGO) Dissemination PDF Document - Web Portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017432 -> Protection of information - SP5 

- TCA-CIAV-017433 -> Read/Write access to portal - SP5

#### SP5-SREQ-83 -> Clients shall validate the web hosting service certificates and block the connection for invalid certificates.

- TCA-CIAV-014555 -> HTTPS Protocol for Web Hosting Services - SP5

- TCA-CIAV-014555 -> HTTPS Protocol for Web Hosting Services - SP5 

- TCA-CIAV-014566 -> Web Platform Profiles - SP5

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017431 -> HTTPS Protocol for Web Hosting Services - SP5



### SP5-TIN-9 -> Web-based Collaboration Provider

#### SP5-SREQ-1034 -> Web applications shall not require any proprietary browser plug-ins on the client side.

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

#### SP5-SREQ-1269 -> Information Management Roles shall apply minimum metadata profile based on STANAG 5636

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-1273 -> Security markings shall be applied to all documents provided to users via Web Hosting Services.

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5 

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-30 -> The Web-based Collaboration shall allow users to manage repositories of information.

- TCA-CIAV-014567 -> Read/Write access to portal - SP5

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017432 -> Protection of information - SP5 

#### SP5-SREQ-31 -> The Web-based Collaboration shall allow users to collaboratively work on the content of the information repositories.

- TCA-CIAV-014567 -> Read/Write access to portal - SP5

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017257 -> Written Directives Fragmentary Order (FRAGO) Dissemination PDF Document - Web Portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

#### SP5-SREQ-311 -> If web content or documents carry security labels, the labels shall be displayed to the user.

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5 

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

#### SP5-SREQ-32 -> Web hosting services shall have the ability to control access to information based on the identity of the user in accordance with the access control policy.

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017432 -> Protection of information - SP5 

- TCA-CIAV-017433 -> Read/Write access to portal - SP5

#### SP5-SREQ-413 -> Security markings shall be applied to all web content.

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5

- TCA-CIAV-014562 -> Security Markings for Web Content - SP5 

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

- TCA-CIAV-017449 -> Security Markings for Web Content - SP5 

#### SP5-SREQ-79 -> User-facing applications hosted by the web hosting services shall be able to authenticate users in accordance with the SI for Web Authentication.

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)

#### SP5-SREQ-81 -> Web Hosting Services shall log at least: user identifier; system activities; dates, times and details of key events; source and target IP addresses and protocol; user access attempts; and records of successful and rejected data and other resource access attempts.

- TCA-CIAV-014453 -> Logging of events within the portal - SP5

- TCA-CIAV-014453 -> Logging of events within the portal - SP5 

- TCA-CIAV-017099 -> National Guidance and Caveats - (IER-53) Web-based Content Hosting

- TCA-CIAV-017232 -> Electronic Target Folder (ETF) - Web-based Content Hosting (IER-82)

- TCA-CIAV-017233 -> Target Nomination List (TNL) - Web-based Content Hosting (IER-65)

- TCA-CIAV-017248 -> Fire Plan - Web-based Content Hosting (IER-77)

- TCA-CIAV-017254 -> Joint Prioritised Target List (IER-61) - web hosting portal

- TCA-CIAV-017263 -> Joint Prioritised Target List (IER-75) - Web-based Content Hosting

- TCA-CIAV-017265 -> Joint Prioritised Target List (IER-279) - Web-based Content Hosting

- TCA-CIAV-017267 -> Candidate Target List (IER-59) - Web-based Collaboration

- TCA-CIAV-017272 -> JISR Product for Target System Analysis - Web-based Content Hosting (IER-56)

- TCA-CIAV-017274 -> Request for Information Responses - Web-based Content Hosting (IER-76)

- TCA-CIAV-017282 -> Mission Report - Web-based Content Hosting (IER-81)

- TCA-CIAV-017286 -> Targeting Annex - Web-based Content Hosting (IER-64)

- TCA-CIAV-017293 -> Fragmentary Order - Web-based Content Hosting (IER-287)

- TCA-CIAV-017295 -> Entity Criticality - Web-based Content Hosting (IER-478)



