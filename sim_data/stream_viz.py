#!/usr/bin/env python
# coding: utf-8

# In[163]:


import matplotlib.pyplot as plt 
import numpy as np
from astropy.io import ascii
from astropy import constants as c
arcsec = '$^{\prime\prime}$'
ins = 'via_fiducial'
# from labellines import labelLines
import astropy
from astropy.table import Table
#import symlib

from gala import dynamics as gd, potential as gp, coordinates as gc
from gala.units import galactic
import agama
from scipy import stats
from scipy.interpolate import UnivariateSpline
from numpy.polynomial.polynomial import polyval, polyfit
# from gala.dynamics import mockstream as ms
# from astropy import units as u, constants as c
# # import agama
# # agama.setUnits(length=1, velocity=1, mass=1)
# # import galstreams
# from astropy import coordinates as acoord
# from sklearn.metrics import pairwise
# from tqdm import tqdm
# import os
# from gala.dynamics import mockstream as ms
# import matplotlib as mpl
# from scipy import stats
# from matplotlib.colors import LogNorm
# from astropy.coordinates import SkyCoord
# import h5py
# import scipy
# import sys
# import numpy
# import cmasher


# In[164]:


import sys

import jax
import jax.numpy as jnp

sys.path.append('/Users/vedantchandra/0_research/software/streamframe/')
from streamframe import streamframe as sf


# In[165]:


jax.__version__


# In[166]:


import numpy


# In[167]:


import streamsculptor
from streamsculptor import potential
from gala.units import UnitSystem
from astropy import units as u
usys = UnitSystem(u.kpc, u.Myr, u.Msun, u.radian)
import jax.numpy as jnp

import diffrax


# In[168]:


plt.style.use('vedant')
get_ipython().run_line_magic('config', "InlineBackend.figure_format='retina'")


# # Impact Sim

# In[162]:


from streamframe import streamframe as sf


# In[7]:


# convert to obs

fromICRStoPal5 = numpy.array([
    [-0.65582036, -0.75491389, -0.00216422],
    [-0.62865701,  0.54771927, -0.55208149],
    [ 0.41795937, -0.36070573, -0.83378735],
])

def get_observed_coords(xv, pc = None, ret_pc = False):
    l, b, dist, pml, pmb, vlos = agama.getGalacticFromGalactocentric(*xv.T)
    ra, dec = agama.transformCelestialCoords(agama.fromGalactictoICRS, l, b)
    phi1, phi2 = agama.transformCelestialCoords(fromICRStoPal5, ra, dec)
    ra, dec, vlos, phi1, phi2 = ra * 180/numpy.pi + 360, dec * 180/numpy.pi, vlos, phi1 * 180/numpy.pi, phi2 * 180/numpy.pi
    
    if pc is None:
        p1, p2 = np.quantile(phi1, [0.01, 0.99])
        clip = (phi1 > p1) & (phi1 < p2)
        pc = polyfit(phi1[clip], vlos[clip], 3)
    spl = polyval(phi1, pc)
    dvlos = vlos - spl

    if ret_pc:
        return pc

    return ra, dec, vlos, phi1, phi2, dvlos


# In[8]:


kms2kpcmyr = (1 * u.km / u.s).to(u.kpc / u.Myr).value


# In[9]:


# Pal-5

ra0, dec0 = 229.0, -0.124
dist0 = 22.9
pmra0, pmdec0 = -2.296, -2.257
vlos0 = -58.7

# use built-in coordinate conversion routines from Agama instead of Astropy: faster, no external dependencies,
# but need to do some extra steps, e.g., convert from degrees to radians and
# from mas/yr to km/s/kpc, the base units used throughout this example (the factor 4.74 below)
l0, b0, pml0, pmb0 = agama.transformCelestialCoords(agama.fromICRStoGalactic,
    ra0*numpy.pi/180, dec0*numpy.pi/180, pmra0, pmdec0)
posvel_sat = np.array(agama.getGalactocentricFromGalactic(l0, b0, dist0, pml0*4.74, pmb0*4.74, vlos0))
posvel_sat[3:] *= kms2kpcmyr


# In[10]:


## Define a potential
pot_MW = potential.GalaMilkyWayPotential(units=usys)

## Define a stream progenitor (observed today)
#w_today = jnp.array([20.0,0.0,20,.0,.15,.0]) # position units: kpc, velocity units: kpc/Myr
w_today = jnp.array(posvel_sat)

## Stream age
t_age = 2_500 # Myr

## Times to backwards integrate through
ts_back = jnp.linspace(0,-t_age, 1000) #save 1000 points
init_cond = pot_MW.integrate_orbit(w0=w_today, ts=ts_back,t0=0.0, t1=-t_age,)

## Initial condition at t1 = -t_age
IC = init_cond.ys[-1]
print('Initial condition = ' + str(IC))
plt.plot(init_cond.ys[:,1], init_cond.ys[:,2]);


# In[11]:


Npart = 1000

## Now define stream model.
## First need stripping times. 
## Last element of the stripping time array is the observation time, that all
## particles will be integrated to.
t_strip = jnp.linspace(-t_age,0, Npart)
Mcluster0 = 1e4 # Msun

## Streamsculptor works with gpu, for which jax.vmap is more effecient than jax.lax.scan.
## IF using cpu, use jax.lax.scan instead.
#lead,trail = pot_MW.gen_stream_vmapped(ts=t_strip, prog_w0=IC, Msat=Mcluster, seed_num=583,)

## Same function, but better for cpu usage. This produces the same result as the above.

Mcluster = jnp.linspace(Mcluster0,0.0,len(t_strip))
lead,trail = pot_MW.gen_stream_scan(ts=t_strip, prog_w0=IC, Msat=Mcluster, seed_num=583)


# In[12]:


stream = jnp.vstack([lead,trail])
stream = np.asarray(stream)


# In[13]:


len(stream)


# In[14]:


fig, ax = plt.subplots(1,1)
fig.set_size_inches(6,6)
ax.scatter(stream[:,1], stream[:,2], s=1,rasterized=True,color='k')
ax.set_xlabel('y [kpc]')
ax.set_ylabel('z [kpc]')
# ax.set_xlim(-10,10)
# ax.set_ylim(17,21)
ax.set_aspect('equal')


# In[63]:


## Select a subset of the stream particles
y_in_bool = (stream[:,1] > -1.5) & (stream[:,1] < -1) 

fig, ax = plt.subplots(1,1)
fig.set_size_inches(6,6)
ax.scatter(stream[:,1], stream[:,2], s=1,rasterized=True,color='k')
ax.scatter(stream[y_in_bool,1], stream[y_in_bool,2], s=1,rasterized=True,color='r')

ax.set_xlabel('y [kpc]')
ax.set_ylabel('z [kpc]')
# ax.set_xlim(-10,10)
# ax.set_ylim(17,21)
ax.set_aspect('equal')


# In[64]:


# impact variables

t_impact = -1000.0

plot = True


# In[65]:


def m2rs(M_sh):
    return 0.65 * (M_sh / 1e8)**(0.43)


# In[66]:


_, _, vrad, phi1, phi2, dvrad = get_observed_coords(stream)
pc = get_observed_coords(stream, ret_pc = True)


# In[99]:


def get_pstream(logm, rmult, vrel, t_impact = -1000, plot = False):

    M_sh = 10**logm
    r_sh = rmult * m2rs(M_sh)
    vrel_kpcmyr = vrel * kms2kpcmyr / np.sqrt(2) # evenly split in two directions

    ## Take the average phasespace location of the selected region. 
    avg_wtoday = stream[y_in_bool,:].mean(axis=0)
    ## Integrate this back to an impact time, at which a subhalo will intersect with the red patch
    t_impact = t_impact # Myr
    w_impact = pot_MW.integrate_orbit(w0=avg_wtoday, ts=jnp.array([0,t_impact]),t0=0.0, t1=t_impact).ys[-1]
    print('Impact location = ' + str(w_impact))

    ## Give the subhalo a slightly different veloction compared to the stream
    #w_subalo = w_impact + jnp.array([0,0,0,vrel_kpcmyr,0.0,vrel_kpcmyr])

    # Stream velocity at impact (vx, vy, vz)
    v_stream = w_impact[3:6]
    v_stream_norm = jnp.linalg.norm(v_stream)

    # Choose some reference direction that is *not* parallel to v_stream
    # (this avoids cross(v_stream, ref) ≈ 0)
    ref = jnp.where(
        jnp.abs(v_stream[0]) < 0.9 * v_stream_norm,
        jnp.array([1.0, 0.0, 0.0]),
        jnp.array([0.0, 1.0, 0.0])
    )

    # A vector perpendicular to v_stream:
    v_perp_dir = jnp.cross(v_stream, ref)
    v_perp_dir = v_perp_dir / jnp.linalg.norm(v_perp_dir)

    # Set its magnitude to vrel_kpcmyr
    delta_v = v_perp_dir * vrel_kpcmyr  # this is *relative* vel, ⟂ to v_stream

    # Subhalo phase-space point: same position, perpendicular relative velocity
    w_subalo = w_impact + jnp.concatenate([jnp.zeros(3), delta_v])


    M_sh = jnp.array([M_sh]) # Msun
    r_sh = jnp.array([r_sh]) # kpc

    ## Define the subhalo potential. We will use the SubhaloLinePotential: implements a plummer sphere subhalo 
    ## potential moving on a straight line.
    ## t_winodw is the window in time for which the subhalo potential is active.
    ## outside of subhalo_t0 +- t_window, the subhalo potential is zero.
    ## All parameters are defined using array inputs, so that multiple subhalos can be defined at once. 
    pot_SH = potential.SubhaloLinePotential(m=M_sh,a=r_sh,subhalo_x0=jnp.array([w_subalo[:3]]), 
                                                subhalo_v=jnp.array([w_subalo[3:]]),
                                                subhalo_t0=jnp.array([t_impact]), t_window=jnp.array([250.0]),units=usys)

    ## Combine subhalo potential and MW potential
    pot_list = [pot_MW,pot_SH]
    pot_total = potential.Potential_Combine(potential_list=pot_list, units=usys)

    # Hernquist_LineSubhalo = potential.SubhaloLinePotential_Custom(pot=potential.HernquistPotential(m=M_sh, r_s=r_sh, units=usys),
    #                                             subhalo_x0=jnp.array([w_subalo[:3]]), 
    #                                             subhalo_v=jnp.array([w_subalo[3:]]),
    #                                             subhalo_t0=jnp.array([t_impact]), t_window=jnp.array([250.0]),units=usys) 

    #print('Hernquist subhalo potential at x: ' + str(Hernquist_LineSubhalo.potential(jnp.array([1.,2.,3.]),-850.0)))
    #print('Plummer subhalo potential at x: ' + str(pot_SH.potential(jnp.array([1.,2.,3.]),-850.0)))
    
    lead_pert , trail_pert = streamsculptor.gen_stream_scan_with_pert(pot_base=pot_MW,pot_pert=pot_SH,ts=t_strip, prog_w0=IC, Msat=Mcluster, seed_num=583,)
    stream_pert = jnp.vstack([lead_pert,trail_pert])
    ## plot the result

    if plot:
        fig, ax = plt.subplots(1,1)
        fig.set_size_inches(6,6)
        ax.scatter(stream[:,1], stream[:,2], s=1,rasterized=True,color='k')
        ax.scatter(stream_pert[:,1], stream_pert[:,2], s=1,rasterized=True,color='r')

        ax.set_xlabel('y [kpc]')
        ax.set_ylabel('z [kpc]')
        # ax.set_xlim(-10,10)
        # ax.set_ylim(17,21)
        ax.set_aspect('equal')

    return stream_pert


# In[133]:


stream_pert = get_pstream(7, 1, 100, -100, plot = True)


# In[134]:


_, _, pvrad, pphi1, pphi2, pdvrad = get_observed_coords(stream_pert, pc = pc)


# In[135]:


philim = [-15, 15]


# In[136]:


plt.scatter(phi1, phi2)
plt.scatter(pphi1, pphi2)
plt.ylim(-5, 5)
plt.xlim(*philim)

plt.gca().set_aspect('equal')


# In[137]:


plt.scatter(pphi1, dvrad)
plt.scatter(pphi1, pdvrad)

plt.xlim(*philim)
plt.ylim(-3, 3)


# In[138]:


plt.scatter(phi1, pdvrad)

plt.ylim(-2, 2)
plt.xlim(-15, 15)


# In[139]:


import itertools
import json
import numpy as np
from pathlib import Path


# In[153]:


# fixed

vrel = 150


def run_simulation(logm, rmult, trel):

    """
    Replace this with your actual code.
    This must return numpy arrays for phi1, phi2, vrad.
    """

    # phi1 = np.random.normal(size=1000)
    # phi2 = np.random.normal(size=1000)
    # vrad = np.random.normal(size=1000)

    stream_pert = get_pstream(logm, rmult, vrel = vrel, t_impact = -trel, plot = False)
    _, _, pvrad, pphi1, pphi2, pdvrad = get_observed_coords(stream_pert, pc = pc)

    return pphi1, pphi2, pdvrad


# In[158]:


param_grid = {
    "logm": [5, 6, 7, 8],
    "rmult": [0.5, 1, 2],
    "trel": [0, 50, 100, 150, 200],
}

outdir = Path("/Users/vedantchandra/0_research/software/via-project/website/public/sim_data/")



# In[159]:


outdir.mkdir(exist_ok=True)

# Delete existing simulation outputs (JSON only — leave this script and anything else intact)
for item in outdir.glob("*.json"):
    item.unlink()


# In[160]:


def to_serializable(x):
    """Convert JAX / NumPy / scalars to plain Python types."""
    # JAX or NumPy array
    if hasattr(x, "shape"):
        return np.asarray(x).tolist()
    # NumPy scalar
    if isinstance(x, (np.generic,)):
        return x.item()
    # Already a Python scalar or container
    return x


# In[161]:


# ----------------------------
# Generate all combinations
# ----------------------------

param_names = list(param_grid.keys())
value_lists = [param_grid[p] for p in param_names]

for values in itertools.product(*value_lists):
    params = dict(zip(param_names, values))

    print("Running:", params)

    # Run the simulation
    phi1, phi2, vrad = run_simulation(**params)

    # Build a filename encoding parameters (simple & human readable)
    fname = "_".join(f"{key}-{params[key]}" for key in param_names) + ".json"

    # Build dictionary to save
    output = {
        "params": params,
        "data": {
            "phi1": to_serializable(phi1),
            "phi2": to_serializable(phi2),
            "vrad": to_serializable(vrad),
        }
    }

    # Save JSON
    with open(outdir / fname, "w") as f:
        json.dump(output, f)

print("Done!")


# In[ ]:


# Diagnostic: reproduce the website's two-panel view from a saved JSON
# (phi1 vs phi2 on top, phi1 vs dvrad on bottom) to sanity-check what the
# React viz is rendering.

def plot_saved_json(logm_pick=7, rmult_pick=1, trel_pick=100,
                    phi1_win=(-14, 14), phi2_win=(-4, 4), dvrad_win=(-2, 2)):
    fname = outdir / f"logm-{logm_pick}_rmult-{rmult_pick}_trel-{trel_pick}.json"
    with open(fname) as f:
        j = json.load(f)
    p1 = np.asarray(j["data"]["phi1"])
    p2 = np.asarray(j["data"]["phi2"])
    dv = np.asarray(j["data"]["vrad"])  # stored key "vrad" is actually dvrad

    p1c = p1 - np.median(p1)

    fig, axes = plt.subplots(2, 1, sharex=True, figsize=(8, 5))
    axes[0].scatter(p1c, p2, s=3, color="k", rasterized=True)
    axes[0].set_ylabel(r"$\phi_2$ [deg]")
    axes[0].set_ylim(*phi2_win)
    axes[0].set_title(f"logm={logm_pick}, rmult={rmult_pick}, trel={trel_pick}")

    axes[1].scatter(p1c, dv, s=3, color="k", rasterized=True)
    axes[1].set_ylabel(r"$\delta v_\mathrm{rad}$ [km/s]")
    axes[1].set_xlabel(r"$\Delta \phi_1$ [deg]")
    axes[1].set_ylim(*dvrad_win)
    axes[1].set_xlim(*phi1_win)

    plt.tight_layout()
    return fig, axes


plot_saved_json(8, 0.5, 200)



# %%
