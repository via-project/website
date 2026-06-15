import React from 'react';
import Section from '../components/Section';
import { leadership, members } from '../data/team';

function Team() {
  return (
    <>
      <Section bg="../img/via_team.png" inner="center-bottom" innerStyle={{bottom:"2%"}}>
        {/* <h1>A Collaboration</h1>
        <h4 style={{textTransform:"uppercase", paddingTop:"10px"}}>{'Carnegie Observatories ● Center for Astrophysics ● Stanford ● Yale'}</h4> */}
      </Section>

      <Section bg="../img/mw_igor_desktop.jpg" overlay="gradient" inner="left-bottom" innerStyle={{maxWidth:"580px"}}>
        <h3>The Via Team</h3>
        <p style={{color: "#fff"}}>A small group of engineers, project managers, and scientists with experience in building optical spectrographs, focal plane systems, and control and analysis pipelines are the core builders of Via.</p>

        <table className="data" style={{width:"85%", marginLeft:"10px"}}>
          <tbody>
            {leadership.map(({ role, people }) => (
              <tr key={role}>
                <td>{role}</td>
                <td>
                  {people.map((p, i) => (
                    <React.Fragment key={p.url}>
                      {i > 0 && <span style={{paddingTop:"10px", display:"block"}}></span>}
                      <a href={p.url}>{p.name}<span> / {p.affil}</span></a>
                    </React.Fragment>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {members.map(({ institution, names }) => (
          <p key={institution}><span className="team">{institution}</span> {names}</p>
        ))}
      </Section>

    </>
  );
}

export default Team;
