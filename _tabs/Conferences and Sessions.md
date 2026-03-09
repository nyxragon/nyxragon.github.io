---
layout: default
icon: fa fa-users
order: 2
---

# Conferences and Sessions

<p class="conference-intro">The following are the security conferences/sessions where I was invited as a Guest speaker.</p>

<div class="conference-grid">

  <div class="conference-card">
    {% include slider.html slider_id="bsides_pune" %}
    <div class="conference-details">
      <h3>BSIDES PUNE</h3>
      <p>Delivered a session on <b>JWT Attacks</b> at the Bsides Pune Security Conference</p>
    </div>
  </div>

  <div class="conference-card">
    {% include slider.html slider_id="owasp_noida" %}
    <div class="conference-details">
      <h3>OWASP NOIDA</h3>
      <p>Presented at OWASP Noida on <b>BAC and IDOR</b> vulnerabilities.</p>
    </div>
  </div>

  <div class="conference-card">
    {% include slider.html slider_id="pict_college" %}
    <div class="conference-details">
      <h3>PICT COLLEGE</h3>
      <p>Conducted a workshop on <b>ethical hacking</b> at PICT College.</p>
    </div>
  </div>

  <div class="conference-card">
    {% include slider.html slider_id="zeron_fireside" %}
    <div class="conference-details">
      <h3>ZERON FIRESIDE CHAT</h3>
      <p>I was invited at the FiresideChat by Zeron on the topic <b>"The Attack Surface Factor: Elevating or Reducing Your Cyber Value at Risk?"</b></p>
    </div>
  </div>

</div>

<style>
.conference-intro {
  opacity: 0.9;
  margin-bottom: 2rem;
}

.conference-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.conference-card {
  flex: 1 1 calc(50% - 12px);
  min-width: 280px;
  padding: 1.25rem;
  border-radius: 12px;
  overflow: hidden;
  background: var(--portfolio-card-bg, #252525);
  border: 1px solid var(--portfolio-card-border, rgba(255,255,255,0.08));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.conference-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  border-color: var(--portfolio-accent);
}

.conference-details {
  margin-top: 1rem;
}

.conference-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: inherit;
}

.conference-details p {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
  color: inherit;
}
</style>
