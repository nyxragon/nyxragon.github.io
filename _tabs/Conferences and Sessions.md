---
layout: default
icon: fa fa-users
order: 2
---

# Conferences and Sessions

<p style="color:white">The following are the security conferences/sessions where I was invited as a Guest speaker:.</p>

<div class="conference-grid">

  <!-- BSIDES PUNE Conference Card -->
  <div class="conference-card">
    {% include slider.html slider_id="bsides_pune" %}
    <div class="conference-details">
      <h3 style="color:white">BSIDES PUNE</h3>
      <p style="color:white">Delivered a session on <b>JWT Attacks</b> at the Bsides Pune Security Conference</p>
    </div>
  </div>

  <!-- OWASP NOIDA Conference Card -->
  <div class="conference-card">
    {% include slider.html slider_id="owasp_noida" %}
    <div class="conference-details">
      <h3 style="color:white">OWASP NOIDA</h3>
      <p style="color:white">Presented at OWASP Noida on <b>BAC and IDOR </b>vulnerabilities.</p>
    </div>
  </div>

  <!-- PICT COLLEGE Conference Card -->
  <div class="conference-card">
    {% include slider.html slider_id="pict_college" %}
    <div class="conference-details">
      <h3 style="color:white">PICT COLLEGE</h3>
      <p style="color:white">Conducted a work shop on <b>ethical hacking</b> at PICT College.</p>
    </div>
  </div>

  <!-- ZERON FIRESIDE CHAT Conference Card -->
  <div class="conference-card">
    {% include slider.html slider_id="zeron_fireside" %}
    <div class="conference-details">
      <h3 style="color:white">ZERON FIRESIDE CHAT</h3>
      <p style="color:white">I was invited at the FiresideChat by Zeron on the topic <b>"The Attack Surface Factor: Elevating or Reducing Your Cyber Value at Risk?"</b></p>
    </div>
  </div>

</div>

<style>
  .conference-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 20px;
  }

  .conference-card {
    flex: 1 1 calc(50% - 20px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    background-color:#242424 ;
  }

  .conference-details {
    margin-top: 15px;
  }

  h3 {
    margin: 10px 0;
    font-size: 1.5rem;
  }

  p {
    color: #555;
  }
</style>
