import React from 'react';
import { leadership, members } from '../data/team';

function Team() {
  return (
    <div className="section section-flow">
      <div className="background" style={{ backgroundImage: "url(../img/mw_igor_desktop.jpg)" }}></div>
      <div className="background-gradient"></div>

      <div className="content-below-nav">
        <h3>The Via Team</h3>
        <p style={{color: "#fff"}}></p>

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
      </div>
    </div>
  );
}

export default Team;
