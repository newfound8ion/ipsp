# Approval by the Foundation

Once an activation function is proposed and registered, the Newcoin Foundation reviews and approves it before it can be activated. This centralized approval process ensures that the activation functions meet the foundation’s standards and objectives, allowing them to operate in a permissionless and trusted manner once approved. The intention is for this process to become decentralized over time, with approvals managed through a foundation voting mechanism.

1. **Foundation Review**:

   - The Newcoin Foundation meticulously reviews each proposed activation function, checking it against the system’s standards, security requirements, and other relevant criteria.
   - Approval is reserved for the foundation or assigned approvers to maintain the integrity of the system.

2. **Notification of Approval**:

   - After the approval of an activation function, an `ActivationFunctionApproved` event is emitted.
   - Developers should listen for this event to verify the approval status of their proposed activation functions. The unique ID assigned during the registration of the activation function will be used to identify the approved functions.

```solidity
emit ActivationFunctionApproved(activationFunctionId);
```

Developers can be attentive to the emitted events to track the status of their proposals and act accordingly once approval is confirmed as well as reaching out via discord or Telegram.
