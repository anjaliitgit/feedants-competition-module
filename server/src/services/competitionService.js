function deriveLifecycle(c) {
  const now = new Date();
  if(c.status === 'completed') return 'completed';
  if(c.submissionEndsAt && now > c.submissionEndsAt) return 'completed';
  if(c.submissionStartsAt && now >= c.submissionStartsAt) return 'submission_open';
  if(c.registrationClosesAt && now > c.registrationClosesAt) return 'registration_closed';
  if(c.status === 'registration_open') return 'registration_open';
  return c.status;
}

function presentCompetition(c, registered=false) {
  const obj = c.toObject ? c.toObject() : {...c};
  obj.lifecycle = deriveLifecycle(obj);
  obj.remainingSpots = Math.max(0,(obj.maxParticipants || 0)-(obj.registeredCount || 0));
  obj.isFull = obj.remainingSpots === 0;
  obj.isRegistered = registered;
  return obj;
}

module.exports = {deriveLifecycle,presentCompetition};
