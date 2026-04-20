# %%
import matplotlib.pyplot as plt 
import numpy as np
from astropy.io import ascii
from astropy import constants as c
arcsec = '$^{\prime\prime}$'
ins = 'via_fiducial'
from labellines import labelLines
import astropy
from astropy.table import Table
#import symlib

from gala import dynamics as gd, potential as gp, coordinates as gc
from gala.units import galactic
from gala.dynamics import mockstream as ms
from astropy import units as u, constants as c
import agama
agama.setUnits(length=1, velocity=1, mass=1)
# import galstreams
from astropy import coordinates as acoord
from sklearn.metrics import pairwise
from tqdm import tqdm
import os
from gala.dynamics import mockstream as ms
import matplotlib as mpl
from scipy import stats
from matplotlib.colors import LogNorm
from astropy.coordinates import SkyCoord
import h5py
import scipy
import sys
import numpy
from numpy.polynomial.polynomial import polyval, polyfit
import cmasher

# %%
import jax
import jax.numpy as jnp

sys.path.append('/Users/vedantchandra/0_research/software/streamframe/')
from streamframe import streamframe as sf

# %%
plt.style.use('vedant')
%config InlineBackend.figure_format='retina'

# %%
def get_rj_vj_R(pot_host, orbit_sat, mass_sat):
    """
    Compute the Jacobi radius, associated velocity, and rotation matrix
    for generating streams using particle-spray methods.
    Arguments:
        pot_host:  an instance of agama.Potential for the host galaxy.
        orbit_sat: the orbit of the satellite, an array of shape (N, 6).
        mass_sat:  the satellite mass (a single number or an array of length N).
    Return:
        rj:  Jacobi radius at each point on the orbit (length: N).
        vj:  velocity offset from the satellite at each point on the orbit (length: N).
        R:   rotation matrix converting from host to satellite at each point on the orbit (shape: N,3,3)
    """
    N = len(orbit_sat)
    x, y, z, vx, vy, vz = orbit_sat.T
    Lx = y * vz - z * vy
    Ly = z * vx - x * vz
    Lz = x * vy - y * vx
    r = (x*x + y*y + z*z)**0.5
    L = (Lx*Lx + Ly*Ly + Lz*Lz)**0.5
    # rotation matrices transforming from the host to the satellite frame for each point on the trajectory
    R = numpy.zeros((N, 3, 3))
    R[:,0,0] = x/r
    R[:,0,1] = y/r
    R[:,0,2] = z/r
    R[:,2,0] = Lx/L
    R[:,2,1] = Ly/L
    R[:,2,2] = Lz/L
    R[:,1,0] = R[:,0,2] * R[:,2,1] - R[:,0,1] * R[:,2,2]
    R[:,1,1] = R[:,0,0] * R[:,2,2] - R[:,0,2] * R[:,2,0]
    R[:,1,2] = R[:,0,1] * R[:,2,0] - R[:,0,0] * R[:,2,1]
    # compute  the second derivative of potential by spherical radius
    #der = pot_host.eval(orbit_sat[:,0:3], der=True)
    # d2Phi_dr2 = -(x**2  * der[:,0] + y**2  * der[:,1] + z**2  * der[:,2] +
    #               2*x*y * der[:,3] + 2*y*z * der[:,4] + 2*z*x * der[:,5]) / r**2

    # points along the satellite orbit (Cartesian)
    pts = orbit_sat[:, 0:3]                      # (N,3)
    x, y, z = pts[:,0], pts[:,1], pts[:,2]
    r2 = x*x + y*y + z*z
    r = np.sqrt(r2)
    n = pts / r[:, None]                         # unit radial vectors

    F, dF = pot_host.forceDeriv(pts)  # F: (N,3), dFdx: (N,3,3)

   # Hessian of Φ is H = - dF/dx
    if dF.ndim == 3:
        H = -dF                                  # (N,3,3)
        d2Phi_dr2 = np.einsum('ni,nij,nj->n', n, H, n)
    else:
        # (N,6) packed symmetric form: [xx, yy, zz, xy, yz, zx]
        dF_xx = dF[:,0]; dF_yy = dF[:,1]; dF_zz = dF[:,2]
        dF_xy = dF[:,3]; dF_yz = dF[:,4]; dF_zx = dF[:,5]
        # n^T H n with H = -dF
        d2Phi_dr2 = -(
            x*x*dF_xx + y*y*dF_yy + z*z*dF_zz +
            2*x*y*dF_xy + 2*y*z*dF_yz + 2*z*x*dF_zx
        ) / r2

    # compute the Jacobi radius and the relative velocity at this radius for each point on the trajectory
    Omega = L / r**2
    rj = (agama.G * mass_sat / (Omega**2 - d2Phi_dr2))**(1./3)
    vj = Omega * rj
    return rj, vj, R

# %%
def create_ic_particle_spray(orbit_sat, rj, vj, R, gala_modified=True, dispfac = 1, vdispfac = 1):
    """
    Create initial conditions for particles escaping through Largange points,
    using the method of Fardal+2015
    Arguments:
        orbit_sat:  the orbit of the satellite, an array of shape (N, 6).
        rj:  Jacobi radius at each point on the orbit (length: N).
        vj:  velocity offset from the satellite at each point on the orbit (length: N).
        R:   rotation matrix converting from host to satellite at each point on the orbit (shape: N,3,3)
        gala_modified:  if True, use modified parameters as in Gala, otherwise the ones from the original paper.
    Return:
        initial conditions for stream particles, an array of shape (2*N, 6) - 
        two points for each point on the original satellite trajectory.
    """
    N = len(rj)
    # assign positions and velocities (in the satellite reference frame) of particles
    # leaving the satellite at both lagrange points (interleaving positive and negative offsets).
    rj = numpy.repeat(rj, 2) * numpy.tile([1, -1], N)
    vj = numpy.repeat(vj, 2) * numpy.tile([1, -1], N)
    R  = numpy.repeat(R, 2, axis=0)
    mean_x  = 2.0
    disp_x  = 0.5 if gala_modified else 0.4
    disp_z  = 0.5
    mean_vy = 0.3
    disp_vy = 0.5 if gala_modified else 0.4
    disp_vz = 0.5
    rx  = dispfac * numpy.random.normal(size=2*N) * disp_x + mean_x
    rz  = dispfac * numpy.random.normal(size=2*N) * disp_z * rj
    rvy =(numpy.random.normal(size=2*N) * vdispfac * disp_vy + mean_vy) * vj * (rx if gala_modified else 1)
    rvz = numpy.random.normal(size=2*N) * vdispfac * disp_vz * vj
    rx *= rj
    offset_pos = numpy.column_stack([rx,  rx*0, rz ])  # position and velocity of particles in the reference frame
    offset_vel = numpy.column_stack([rx*0, rvy, rvz])  # centered on the progenitor and aligned with its orbit
    ic_stream = numpy.tile(orbit_sat, 2).reshape(2*N, 6)   # same but in the host-centered frame
    ic_stream[:,0:3] += numpy.einsum('ni,nij->nj', offset_pos, R)
    ic_stream[:,3:6] += numpy.einsum('ni,nij->nj', offset_vel, R)
    return ic_stream

# %%
def create_stream_particle_spray(time_total, num_particles, pot_host, posvel_sat, mass_sat, gala_modified=True, dispfac = 1, vdispfac = 1):
    """
    Construct a stream using the particle-spray method.
    Arguments:
        time_total:  duration of time for stream generation 
            (positive; orbit of the progenitor integrated from present day (t=0) back to time -time_total).
        num_particles:  number of points in the stream (even; divided equally between leading and trailing arms).
        pot_host:    an instance of agama.Potential for the host galaxy.
        posvel_sat:  present-day position and velocity of the satellite (array of length 6).
        mass_sat:    the satellite mass (a single number or an array of length num_particles//2).
        gala_modified:  if True, use modified parameters as in Gala, otherwise the ones from the original paper.
    Return:
        xv_stream: position and velocity of stream particles at present time (shape: num_particles, 6).
    """
    # number of points on the orbit: each point produces two stream particles (leading and trailing arms)
    N = num_particles//2

    # integrate the orbit of the progenitor from its present-day posvel (at time t=0)
    # back in time for an interval time_total, storing the trajectory at N points
    time_sat, orbit_sat = agama.orbit(
        potential=pot_host, ic=posvel_sat, time=-time_total, trajsize=N+1)
    # remove the 0th point (the present-day posvel) and reverse the arrays to make them increasing in time
    time_sat  = time_sat [1:][::-1]
    orbit_sat = orbit_sat[1:][::-1]

    # at each point on the trajectory, create a pair of seed initial conditions
    # for particles released at both Lagrange points
    rj, vj, R = get_rj_vj_R(pot_host, orbit_sat, mass_sat)
    ic_stream = create_ic_particle_spray(orbit_sat, rj, vj, R, gala_modified, dispfac=dispfac, vdispfac=vdispfac)
    time_seed = numpy.repeat(time_sat, 2)
    result = agama.orbit(
        potential=pot_host, ic=ic_stream,
        timestart=time_seed,  # starting time for each orbit (negative)
        time=-time_seed,      # integration time for each orbit: time_start + time = 0 (end time, i.e. now)
        trajsize=1)           # each orbit produces just one point (at the end of the integration)
    # 0th column is the array of times (here, just one element for each orbit, i.e. its end time),
    # 1st column is the trajectory (here, one end point per orbit)
    xv_stream = numpy.vstack(result[:,1])
    
    return xv_stream

# %%
import numpy as np
import astropy.units as u
from astropy.coordinates import (
    SkyCoord, Galactocentric,
    CartesianRepresentation, CartesianDifferential
)
from astropy.coordinates.matrix_utilities import rotation_matrix, matrix_product

def _build_icrs_to_stream_rotation(pole_icrs, ra0_icrs):
    lon_pole = pole_icrs.ra.to(u.deg)
    lat_pole = pole_icrs.dec.to(u.deg)
    Rz1 = rotation_matrix(-lon_pole, "z")
    Ry  = rotation_matrix(-(90*u.deg - lat_pole), "y")
    Rz2 = rotation_matrix(-ra0_icrs, "z")
    return matrix_product(Rz2, Ry, Rz1)

def _cart_from_skycoord_icrs(c):
    v = c.cartesian.xyz.value  # (3,N)
    return v / np.linalg.norm(v, axis=0, keepdims=True)

def _sph_from_rotated_cart(v_rot):
    x, y, z = v_rot
    phi1 = np.arctan2(y, x) * u.rad
    phi2 = np.arcsin(z) * u.rad
    return phi1.to(u.deg), phi2.to(u.deg)

def _wrap_pi(angle_rad):
    """Wrap to (-pi, pi]."""
    return (angle_rad + np.pi) % (2*np.pi) - np.pi

def _circular_median(phi_rad):
    """
    Circular median via: unwrap around circular mean, then take median.
    Returns the median in radians, in (-pi,pi].
    """
    # circular mean (as center for unwrapping)
    s, c = np.sin(phi_rad), np.cos(phi_rad)
    mu = np.arctan2(np.sum(s), np.sum(c))  # (-pi,pi]
    # unwrap each angle to be near mu
    phi_unwrap = _wrap_pi(phi_rad - mu) + mu
    med = np.median(phi_unwrap)
    return _wrap_pi(med)

def stream_coords_from_galcen(
    xyzvxvyvz,
    obstime="J2016.0",
    galcen_frame_kwargs=None,
    reference_index=None
):
    """
    Inputs
    ------
    xyzvxvyvz : (N,6) array_like
        Galactocentric [x,y,z,vx,vy,vz]; x,y,z in kpc; v* in km/s (Astropy conventions).
    obstime : str or Time
    galcen_frame_kwargs : dict, optional
    reference_index : int, optional
        Used only to set initial phi1 orientation and ra0; origin will be
        re-centered to the median afterwards.

    Returns
    -------
    phi1 : Quantity [deg]   (median exactly 0)
    phi2 : Quantity [deg]   (median exactly 0)
    v_galcen_rad : Quantity [km/s]
    meta : dict with keys:
        'pole_icrs'              : SkyCoord
        'ra0_icrs'               : Angle
        'R_icrs_to_stream'       : 3x3 numpy array (rotation)
        'phi1_zero_offset_deg'   : float (added to achieve median(phi1)=0)
        'phi2_zero_offset_deg'   : float (added to achieve median(phi2)=0)
    """
    xyzvxvyvz = np.asarray(xyzvxvyvz, dtype=float)
    assert xyzvxvyvz.ndim == 2 and xyzvxvyvz.shape[1] == 6, "Expect (N,6) array."

    # Unpack with units
    x, y, z, vx, vy, vz = (xyzvxvyvz[:, i] for i in range(6))
    pos = CartesianRepresentation(x=x*u.kpc, y=y*u.kpc, z=z*u.kpc)
    vel = CartesianDifferential(d_x=vx*u.km/u.s, d_y=vy*u.km/u.s, d_z=vz*u.km/u.s)

    gkwargs = {} if galcen_frame_kwargs is None else dict(galcen_frame_kwargs)
    gal_frame = Galactocentric(**gkwargs)

    # Build Galactocentric SkyCoord
    c_gal = SkyCoord(pos.with_differentials(vel), frame=gal_frame, obstime=obstime)

    # ---------- 1) Stream pole from mean (r × v) ----------
    r = c_gal.cartesian.xyz.to(u.kpc).value.T
    v = c_gal.cartesian.differentials['s'].d_xyz.to(u.km/u.s).value.T
    h = np.cross(r, v)                                  # (N,3)
    h /= np.linalg.norm(h, axis=1, keepdims=True)
    n_vec = np.nanmean(h, axis=0); n_vec /= np.linalg.norm(n_vec)

    pole_gal = SkyCoord(Galactocentric(x=n_vec[0]*u.kpc,
                                       y=n_vec[1]*u.kpc,
                                       z=n_vec[2]*u.kpc,
                                       representation_type='cartesian'),
                        obstime=obstime)
    pole_icrs = pole_gal.transform_to("icrs")
    pole_icrs = SkyCoord(ra=pole_icrs.ra, dec=pole_icrs.dec, frame="icrs")

    # ICRS coords of stars
    c_icrs = c_gal.transform_to("icrs")

    # Choose reference RA for initial phi1 zero (we'll re-center later anyway)
    if reference_index is None:
        ra_vals = c_icrs.ra.degree
        reference_index = int(np.argmin(np.abs(ra_vals - np.median(ra_vals))))
    ra0_icrs = c_icrs.ra[reference_index]

    # ---------- 2) Rotation ICRS -> stream frame ----------
    R = _build_icrs_to_stream_rotation(pole_icrs, ra0_icrs)

    # Initial (phi1, phi2)
    v_icrs = _cart_from_skycoord_icrs(c_icrs)
    v_stream = R @ v_icrs
    phi1, phi2 = _sph_from_rotated_cart(v_stream)  # deg

    # ---------- 3) Ensure +phi1 follows mean on-sky motion ----------
    eps = (1e-4 * u.deg).to(u.rad).value
    u_ref_icrs = v_icrs[:, reference_index]
    u_ref_stream = v_stream[:, reference_index]

    lon_ref = np.arctan2(u_ref_stream[1], u_ref_stream[0])
    lat_ref = np.arcsin(u_ref_stream[2])
    lon_ahead = lon_ref + eps
    ca, sa = np.cos(lon_ahead), np.sin(lon_ahead)
    cl, sl = np.cos(lat_ref), np.sin(lat_ref)
    ahead_stream = np.array([cl*ca, cl*sa, sl])
    ahead_icrs = R.T @ ahead_stream
    t_phi1 = ahead_icrs - u_ref_icrs
    t_phi1 /= np.linalg.norm(t_phi1)

    vref = c_icrs.cartesian.differentials['s'].d_xyz.value[:, reference_index]
    rhat_ref = u_ref_icrs / np.linalg.norm(u_ref_icrs)
    v_tan = vref - np.dot(vref, rhat_ref) * rhat_ref

    if np.dot(v_tan, t_phi1) < 0:
        # Flip phi1 direction
        R_flip = np.diag([-1.0, -1.0, 1.0])
        R = R_flip @ R
        v_stream = R @ v_icrs
        phi1, phi2 = _sph_from_rotated_cart(v_stream)

    # # ---------- 4) Center (phi1, phi2) so medians are (0,0) ----------
    # # Circular median for phi1
    # phi1_rad = phi1.to(u.rad).value
    # phi1_med = _circular_median(phi1_rad)  # radians in (-pi,pi]
    # # Shift and wrap back to (-pi,pi]
    # phi1_centered = _wrap_pi(phi1_rad - phi1_med) * u.rad
    # # Linear median for phi2
    # phi2_med = np.median(phi2.value) * u.deg
    # phi2_centered = (phi2 - phi2_med).to(u.deg)

    # ---------- 5) Galactocentric radial velocity ----------
    v_galcen_rad = c_gal.spherical.differentials['s'].d_distance.to(u.km/u.s)

    # meta = dict(
    #     pole_icrs=pole_icrs,
    #     ra0_icrs=ra0_icrs,
    #     R_icrs_to_stream=R,
    #     phi1_zero_offset_deg=float(np.degrees(phi1_med)),
    #     phi2_zero_offset_deg=float(phi2_med.to_value(u.deg))
    # )

    return phi1.to(u.deg).value, phi2.to(u.deg).value, v_galcen_rad.value, None


# %%
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse
import matplotlib.colors as mcolors

def draw_mw_cartoon(
    ax,
    R_disk=15.0,          # kpc, radial extent of drawn disk outline
    hz=0.35,              # kpc, thin-disk half-thickness (minor axis of ellipse)
    R_bulge=2.0,          # kpc, bulge half-width in X
    z_bulge=1.3,          # kpc, bulge half-height in Z
    R0=8.2,               # kpc, solar radius
    sun_x_sign=+1,        # +1 for Astropy Galactocentric (Sun at +X), -1 otherwise
    lw=1.2, alpha=0.7, color="0.5",
    show_bulge=True, show_sun=True, sun_ms=18,
    # fill options
    fill=True, fill_color="0.9", fill_alpha=0.25,
    zorder_fill=-5, zorder_edge=2
):
    """
    Minimal Milky Way cartoon in an X–Z slice.
    Now with optional light-gray fill for the disk and (optionally) bulge.

    - Disk: ellipse centered at (0,0) with width=2*R_disk, height=2*hz
    - Bulge: ellipse centered at (0,0) with width=2*R_bulge, height=2*z_bulge
    - Sun: star marker at (±R0, 0)
    """
    t = np.linspace(0, 2*np.pi, 400)

    # --- Filled shapes (behind data) ---
    if fill:
        face_rgba = mcolors.to_rgba(fill_color, fill_alpha)

        disk_patch = Ellipse(
            (0.0, 0.0), width=2*R_disk, height=2*hz,
            facecolor=face_rgba, edgecolor="none",
            zorder=zorder_fill
        )
        ax.add_patch(disk_patch)

        if show_bulge:
            bulge_patch = Ellipse(
                (0.0, 0.0), width=2*R_bulge, height=2*z_bulge,
                facecolor=face_rgba, edgecolor="none",
                zorder=zorder_fill+0.1
            )
            ax.add_patch(bulge_patch)

    # --- Crisp outlines on top ---
    x_disk = R_disk * np.cos(t)
    z_disk = hz     * np.sin(t)
    ax.plot(x_disk, z_disk, color=color, lw=lw, alpha=alpha, zorder=zorder_edge)

    if show_bulge:
        x_b = R_bulge * np.cos(t)
        z_b = z_bulge * np.sin(t)
        ax.plot(x_b, z_b, color=color, lw=lw, alpha=alpha, zorder=zorder_edge)

    # Midplane and symmetry axis (very subtle)
    #ax.axhline(0, color=color, lw=0.8, alpha=0.35, zorder=zorder_edge)
    #ax.axvline(0, color=color, lw=0.6, alpha=0.25, linestyle=":", zorder=zorder_edge)

    # Sun
    if show_sun:
        x_sun = sun_x_sign * R0
        ax.plot([x_sun], [0.0], marker="$\odot$", markersize=sun_ms,
                color=color, alpha=0.9, zorder=zorder_edge+1)

    ax.set_aspect("equal", adjustable="box")


# %%
from astropy import units as u
from astropy.cosmology import Planck18 as cosmo

def nfw_scale_radius(
    M_vir,
    z=0.0,
    Delta=200,                    # overdensity wrt critical
    c0=10.0,                      # concentration at pivot mass
    alpha=-0.10,                  # slope of c(M)
    M_pivot=1e12 * u.Msun,        # pivot mass
):
    """
    Return the NFW scale radius r_s for a halo of mass M_vir (at overdensity Delta wrt critical).
    
    Parameters
    ----------
    M_vir : float or Quantity
        Virial mass (Msun). If unitless, assumed Msun.
    z : float
        Redshift for rho_crit(z).
    Delta : float
        Overdensity definition (e.g. 200 for "M200c").
    c0, alpha, M_pivot : floats/Quantity
        Power-law concentration–mass: c(M) = c0 * (M/M_pivot)**alpha (at this z).
    
    Returns
    -------
    r_s : Quantity
        NFW scale radius in kpc.
    c : float
        Concentration used.
    R_vir : Quantity
        Virial radius corresponding to (M_vir, Delta) in kpc.
    """
    M = u.Quantity(M_vir, u.Msun)
    rho_c = cosmo.critical_density(z).to(u.Msun / u.kpc**3)
    R_vir = (3 * M / (4 * np.pi * Delta * rho_c))**(1/3)
    c = float(c0) * (M / u.Quantity(M_pivot)).decompose().value**alpha
    r_s = (R_vir / c).to(u.kpc)
    return r_s, c, R_vir

# %%
masses = np.logspace(6, 9, 200)
rs_vals = np.array([nfw_scale_radius(m)[0].value for m in masses])

plt.figure(figsize=(6, 4))
plt.loglog(masses, rs_vals, 'k-')
plt.xlabel(r'$M_\mathrm{sub}$ [M$_\odot$]')
plt.ylabel(r'$r_s$ [kpc]')
plt.title('NFW scale radius vs subhalo mass')
plt.grid(True, alpha=0.3)
plt.tight_layout()

# %%
import numpy as np
import matplotlib.pyplot as plt

def plot_velocity_arrow(vec6, c1=1, c2=2, scale=1.0, ax=None, hw = 0.1, **kwargs,):
    """
    vec6 : array-like, shape (6,)
        Input vector [x, y, z, vx, vy, vz]
    c1, c2 : int
        Indices of coordinates to project onto (0=x, 1=y, 2=z)
    scale : float
        Factor to scale the velocity vector
    ax : matplotlib axis
        Optional axis to plot on
    kwargs : additional kwargs passed to ax.arrow (e.g., color='r', width=0.01)
    """
    vec6 = np.asarray(vec6)
    pos = vec6[:3]
    vel = vec6[3:]

    start = pos[[c1, c2]]
    delta = scale * vel[[c1, c2]]

    # if ax is None:
    #     fig, ax = plt.subplots()

    ax.arrow(start[0], start[1], delta[0], delta[1],
             head_width=hw, length_includes_head=True, **kwargs)
    # ax.set_xlabel(f"Coord {c1}")
    # ax.set_ylabel(f"Coord {c2}")
    # ax.set_aspect('equal')
    # ax.grid(True)
    # ax.set_title("Projected Velocity Arrow")
    return ax


# %%
fromICRStoPal5 = numpy.array([
    [-0.65582036, -0.75491389, -0.00216422],
    [-0.62865701,  0.54771927, -0.55208149],
    [ 0.41795937, -0.36070573, -0.83378735],
])

def get_observed_coords(xv):
    l, b, dist, pml, pmb, vlos = agama.getGalacticFromGalactocentric(*xv.T)
    ra, dec = agama.transformCelestialCoords(agama.fromGalactictoICRS, l, b)
    phi1, phi2 = agama.transformCelestialCoords(fromICRStoPal5, ra, dec)
    return ra * 180/numpy.pi + 360, dec * 180/numpy.pi, vlos, phi1 * 180/numpy.pi, phi2 * 180/numpy.pi

# %%
# sky coordinates in degrees, distance in kpc, proper motion in mas/yr, heliocentric line-of-sight velocity in km/s
ra0, dec0 = 229.0, -0.124
dist0 = 22.9
pmra0, pmdec0 = -2.296, -2.257
vlos0 = -58.7

# use built-in coordinate conversion routines from Agama instead of Astropy: faster, no external dependencies,
# but need to do some extra steps, e.g., convert from degrees to radians and
# from mas/yr to km/s/kpc, the base units used throughout this example (the factor 4.74 below)
l0, b0, pml0, pmb0 = agama.transformCelestialCoords(agama.fromICRStoGalactic,
    ra0*numpy.pi/180, dec0*numpy.pi/180, pmra0, pmdec0)
posvel_sat = agama.getGalactocentricFromGalactic(l0, b0, dist0, pml0*4.74, pmb0*4.74, vlos0)

# Rotation matrix for conversion from ICRS to the Pal5 stream coordinate system (taken from Gala)
fromICRStoPal5 = numpy.array([
    [-0.65582036, -0.75491389, -0.00216422],
    [-0.62865701,  0.54771927, -0.55208149],
    [ 0.41795937, -0.36070573, -0.83378735],
])

# fiducial potential of the Milky Way, consisting of a disk and a spherical halo
pot_host = agama.Potential(
    dict(type='MiyamotoNagai', mass=6e10, scaleRadius=3.5, scaleHeight=0.28),
    dict(type='NFW', mass=1e12, scaleRadius=20)
)

mass_sat   = 1e4  # in Msun
radius_sat = 0.01  # in kpc
time_total = 3.0    # in time units (0.978 Gyr)
num_particles = int(5e3)  # number of particles in the stream

# %%
def get_obs(stream, posvel_sat):

    posvel = stream.copy()
    posvel[:,3:] /= 977.8
    posvel = jnp.array(posvel)
    prog_posvel = np.array(posvel_sat).copy()
    prog_posvel[3:] /= 977.8
    prog_posvel = jnp.array(prog_posvel)
    #_, _, vrad, phi1, phi2 = get_observed_coords(stream)

    stream_obj = sf(sim_coords = posvel, origin_particle=prog_posvel)
    coords = stream_obj.coordsfrom_Lvec
    phi1 = coords['phi1']
    phi2 = coords['phi2']
    r = coords['r']
    vrad = coords['vr']

    return phi1, phi2, vrad

# %%
# # Convert to astropy Galactocentric coordinate frame
# pos = CartesianRepresentation(posvel[:, 0]*u.kpc, posvel[:, 1]*u.kpc, posvel[:, 2]*u.kpc)
# vel = CartesianDifferential(posvel[:, 3]*u.kpc / u.Myr, posvel[:, 4]*u.kpc / u.Myr, posvel[:, 5]*u.kpc / u.Myr)
# coord = Galactocentric(pos.with_differentials(vel))

# # Get position and velocity vectors (N, 3)
# r = coord.cartesian.xyz.to(u.kpc).T.value      # shape (N, 3)
# v = coord.velocity.d_xyz.to(u.km/u.s).T.value  # shape (N, 3)

# # Compute radial velocity: v_rad = (v · r) / |r|
# vgsr = np.sum(v * r, axis=1) / np.linalg.norm(r, axis=1)
# #v_rad = v_rad.value
# #print(v_rad)

# %%
stream = create_stream_particle_spray(time_total, num_particles, pot_host, posvel_sat, mass_sat, dispfac = 1, vdispfac = 0.5)
phi1, phi2, vrad = get_obs(stream, posvel_sat)

p = 0.0005
ends = np.quantile(phi1, [p, 1-p])

clip = (phi1 > ends[0]) & (phi1 < ends[1])

stream = stream[clip]

phi1, phi2, vrad = get_obs(stream, posvel_sat)

# %%
plt.scatter(phi1, phi2, s = 1)
plt.gca().set_aspect('equal')
#plt.ylim(-25, 25)
plt.xlim(-25, 25)

# %%
plt.scatter(phi1, vrad)
# plt.scatter(phi1, vgsr)

# %%
c1 = 1
c2 = 2

sel = (stream[:,1] > -2.5) & (stream[:,1] < -2) 


plt.scatter(stream[:, c1], stream[:, c2], s = 1, color = 'k');
plt.scatter(stream[:, c1][sel], stream[:, c2][sel], s = 1, color = 'C3');

# %%
N = 1000
t_impact = -30/1000 # Myr
gap = np.abs(t_impact)
m_sub = 1e7
r_sub = nfw_scale_radius(m_sub)[0].value * 0.2


t_start = t_impact - gap - 0.1 # start the simulation at this time, forward to t = 0
## Take the average phasespace location of the selected region. 
avg_wtoday = stream[sel,:].mean(axis=0)
## Integrate this back to an impact time, at which a subhalo will intersect with the red patch
w_impact = agama.orbit(
        potential=pot_host, ic=avg_wtoday,
        timestart=0.0,  # starting time for each orbit (negative)
        time=t_impact,      # integration time for each orbit: time_start + time = 0 (end time, i.e. now)
        trajsize=1)[1][0]           # each orbit produces just one point (at the end of the integration)

print('Impact location = ' + str(w_impact))

w_sub = w_impact.copy()
# w_sub[4] *= -1.0 # perpendicular impact
# w_sub[3] *= -1.0 # perpendicular impact
# w_sub[5] *= -1.0 # perpendicular impact

w_sub[3] = 0
w_sub[4] = 75
w_sub[5] = -100

w_sub[0] += 0.0

print(m_sub, r_sub)

w0_impact = agama.orbit(
        potential=pot_host, ic=w_impact,
        timestart=t_impact,  # starting time for each orbit (negative)
        time=(t_start - t_impact),      # integration time for each orbit: time_start + time = 0 (end time, i.e. now)
        trajsize=1)[1][0]   

w0_sub = agama.orbit(
        potential=pot_host, ic=w_sub,
        timestart=t_impact,  # starting time for each orbit (negative)
        time=(t_start - t_impact),      # integration time for each orbit: time_start + time = 0 (end time, i.e. now)
        trajsize=1)[1][0]   

traj_sub = np.column_stack(agama.orbit(
        potential=pot_host, ic=w0_sub,
        timestart=t_start,  # starting time for each orbit (negative)
        time=-t_start,      # integration time for each orbit: time_start + time = 0 (end time, i.e. now)
        trajsize=N))


pot_sub = agama.Potential(type = 'nfw', mass = m_sub, scaleRadius = r_sub, center = traj_sub)

pot_tot = agama.Potential(pot_host, pot_sub)

# %%
stream0 = agama.orbit(potential = pot_host, ic = stream,
                timestart = 0.0, time = t_start, trajsize = 1)
stream0 = np.vstack(stream0[:, 1])

prog0 = agama.orbit(potential = pot_host, ic = posvel_sat,
                timestart = 0.0, time = t_start, trajsize = 1)[1][0]

# %%
c1 = 1
c2 = 2

plt.scatter(stream[:, c1], stream[:, c2], s = 1, color = 'k');
plt.scatter(stream[:, c1][sel], stream[:, c2][sel], s = 1, color = 'C3');
# plt.scatter(w_impact[c1], w_impact[c2], color = 'C1', s = 100)
# plt.scatter(w0_sub[c1], w0_sub[c2], color = 'C2', s = 100)

plt.plot(traj_sub[:, 1+c1], traj_sub[:, 1+c2], 'C3')

# %%
plt.scatter(stream0[:, c1], stream0[:, c2], s = 1)
plt.scatter(w0_sub[c1], w0_sub[c2], color = 'C2', s = 100)

# %%
# integrate stream + subhalo forward in time

def get_stream(t_now, t_frame = None):

    if t_frame is None:
        t_frame = t_now

    #stream = agama.orbit(potential = pot_host, ic = stream0,
    #                timestart = t_start, time = t_now-t_start, trajsize = 1)

    prog = agama.orbit(potential = pot_tot, ic = w0_impact,
                    timestart = t_start, time = t_frame-t_start, trajsize = 1)[1][0]

    pstream = agama.orbit(potential = pot_tot, ic = stream0,
                    timestart = t_start, time = t_now-t_start, trajsize = 1)

    #stream = np.vstack(stream[:, 1])

    pstream = np.vstack(pstream[:, 1])

    sub = agama.orbit(
            potential=pot_host, ic=w0_sub,
            timestart=t_start,  # starting time for each orbit (negative)
            time=t_now-t_start,      # integration time for each orbit: time_start + time = 0 (end time, i.e. now)
            trajsize=1)[1][0]

    #phi1, phi2, vrad, _ = stream_coords_from_galcen(pstream)
    #phi10, phi20, vrad0, _ = stream_coords_from_galcen(stream)
    #_, _, vrad, phi1, phi2 = get_observed_coords(pstream)
    phi1, phi2, vrad = get_obs(pstream, prog)

    return pstream, sub, prog, (phi1, phi2, vrad)

# %%
pstream, sub, prog, (phi1, phi2, vrad) = get_stream(t_impact, t_frame = t_impact + 0.01)

# %%
np.median(phi1)

# %%
plt.scatter(pstream[:, 1], pstream[:, 2], s = 1, alpha = 0.1)
plt.scatter(prog[1], prog[2])

# %%
plt.scatter(stream0[:, 1], stream0[:, 2], s = 1, alpha = 0.1)
plt.scatter(prog0[1], prog0[2])

# %%
plt.hist(phi1);

# %%
# times = np.linspace(-0.2, 0.0, 3)

#gap = 0.01
times = np.array([t_impact - gap, t_impact, t_impact + 6 * gap])

# %%
dtimes = times - t_impact

# %%
tkw = dict(fontsize = 18)

# %%
times

# %%
# labels = ['$t_\mathrm{impact} - %i$ Myr' % (gap * 1000),
# '$t_\mathrm{impact}$',
# '$t_\mathrm{impact} + %i$ Myr' % (gap * 1000)]

labels = ['%i Myr before impact' % ((t_impact - times[0]) * 1000),
'at impact',
'%i Myr after impact' % ((times[-1] - t_impact) * 1000)]

# %%
mosaic = """\
012
012
345
678
"""

fig = plt.figure(figsize = (20, 12), layout = 'constrained')
axd = fig.subplot_mosaic(mosaic)
alf = 1
ctr = 0
xs = [];
impact_max = np.zeros(len(stream))

for i,time in enumerate(times):

    #########################################
    ############   GALCEN ################
    #########################################

    plt.sca(axd[str(ctr)])
    pstream, sub, prog, (phi1, phi2, vrad) = get_stream(time, t_frame = time)

    b = np.linalg.norm(pstream[:, :3] - sub[:3], axis = 1)
    dv = np.linalg.norm(pstream[:, 3:] - sub[3:], axis = 1)

    impact = 1 / (b * dv)

    impact_max = np.max([impact_max, impact], axis = 0)

    #plt.scatter(pstream[:, c1], pstream[:, c2], s = 1, color = 'k', alpha = 0.5)
    srt = np.argsort(impact_max)
    col = np.log10(impact_max)
    plt.scatter(pstream[:, c1][srt], pstream[:, c2][srt], s = 1, c = col[srt], alpha = 0.5, cmap = 'turbo', vmin = -3.0, vmax = -1.0, rasterized = True)

    plt.scatter(sub[c1], sub[c2], color = 'k', s = 250, edgecolor = 'gray', lw = 2)

    plot_velocity_arrow(sub, c1 = c1, c2 = c2, scale = 0.03, ax = plt.gca(), color = 'C3', hw = 0.5, zorder = 0)

    #plt.plot([-10, 10], [0, 0], color = 'darkgoldenrod', lw = 10, zorder = 0)


    plt.gca().set_aspect('equal')
    lim = 28

    cen = [np.median(pstream[:, c1]), np.median(pstream[:, c2])]

    # plt.xlim(cen[0]-lim, cen[0]+lim)
    # plt.ylim(cen[1]-lim, cen[1]+lim)

    plt.xlim(-lim, +lim)
    yfac = 0.8
    plt.ylim(-lim*yfac, +lim*yfac)

    fs = 18
    if i == 0:
        plt.text(sub[c1] - 2.5, sub[c2], 'subhalo', fontsize = fs, ha = 'right', va = 'center')
        plt.text(prog[c1] + 4.0, prog[c2] - 5, 'stream', fontsize = fs, ha = 'left', va = 'center')
        plt.text(-4, 2.5, 'Sun', fontsize = fs, ha = 'center', va = 'center')
        plt.text(0, -2.0, 'Milky Way', fontsize = fs, ha = 'center', va = 'top')

    

    ax = plt.gca()
    # # Minimal MW line art:
    draw_mw_cartoon(ax, R_disk=15, hz=0.35, R_bulge=2.0, z_bulge=1.3,
                    R0=8.2, sun_x_sign=0, color="0.4")

    # Optional: faint MN potential contours (kept sparse for minimalism)
    # draw_mn_contours(ax, xlim=(-50, 50), zlim=(-25, 25),
    #                 levels=5, color="0.7", lw=0.7, alpha=0.4,
    #                 a=6.5, b=0.26, Mdisk=6e10)

    plt.xlabel('Y [kpc]')
    if i == 0: plt.ylabel('Z [kpc]')

    lab = labels[i]
    plt.title(lab, y = 1.01)


    #########################################
    ############   PHI 1 - PHI 2 ################
    #########################################

    plt.sca(axd[str(ctr+3)])

    # ACTUAL PLOT
    x = phi1
    vel = phi2

    impact_today = 0.0 #np.median(x[sel])
    print(np.median(phi1))
    print(impact_today)

    fitsel = np.abs(x - impact_today) < 10
    lin = polyval(x, polyfit(x[fitsel], vel[fitsel], 2))
    dvel = vel - lin
    plt.scatter(x - impact_today, dvel, s = 1, color = 'k', alpha = alf, rasterized = True)
    lim = 7
    ylim = 1.5
    plt.xlim( - lim,  + lim)
    plt.ylim(- ylim, ylim)
    # plt.gca().set_aspect(0.225)

    #plt.xlabel('$\phi_1$ [deg]')
    if i == 0: plt.ylabel('$\phi_2$ [deg]')
    plt.gca().set_xticklabels([])


    #########################################
    ############   PHI 1 - Vr 2 ################
    #########################################

    plt.sca(axd[str(ctr+6)])


    # ACTUAL PLOT
    x = phi1
    vel = vrad

    impact_today = 0.0 #np.median(x[sel])
    print(np.median(phi1))
    print(impact_today)

    fitsel = np.abs(x - impact_today) < 10
    lin = polyval(x, polyfit(x[fitsel], vel[fitsel], 2))
    dvel = vel - lin
    plt.scatter(x - impact_today, dvel, s = 1, color = 'k', alpha = alf, rasterized = True)
    # lim = 7
    ylim = 15
    plt.xlim( - lim,  + lim)
    plt.ylim(- ylim, ylim)
    # plt.gca().set_aspect(0.225)

    plt.xlabel('$\Delta \phi_1$ [deg]')
    if i == 0: plt.ylabel('$v_\mathrm{r}$ [km$\,$s$^{-1}$]')
        
        
    ctr += 1

#plt.savefig('../docs/technical/fig/impact_schematic.pdf')

# %%
def plot_snapshot_old(t_now, sigma_v=0.0, phi1_lim=7, phi2_ylim=1.5, vrad_ylim=15, fit_radius=10, noise_seed=42):
    """Original version using the global get_stream / pot_tot setup."""
    pstream, sub, prog, (phi1, phi2, vrad) = get_stream(t_now, t_frame=t_now)

    if sigma_v > 0:
        rng = np.random.default_rng(noise_seed)
        vrad = vrad + rng.normal(scale=sigma_v, size=len(vrad))

    impact_today = 0.0
    fitsel = np.abs(phi1 - impact_today) < fit_radius

    fig, axes = plt.subplots(2, 1, sharex=True, figsize=(8, 5))

    lin_phi2 = polyval(phi1, polyfit(phi1[fitsel], phi2[fitsel], 2))
    dphi2 = phi2 - lin_phi2
    axes[0].scatter(phi1 - impact_today, dphi2, s=1, color='k', rasterized=True)
    axes[0].set_ylabel(r'$\phi_2$ [deg]')
    axes[0].set_ylim(-phi2_ylim, phi2_ylim)

    lin_vrad = polyval(phi1, polyfit(phi1[fitsel], vrad[fitsel], 2))
    dvrad = vrad - lin_vrad
    axes[1].scatter(phi1 - impact_today, dvrad, s=1, color='k', rasterized=True)
    if sigma_v > 0:
        axes[1].errorbar(phi1 - impact_today, dvrad, yerr=sigma_v,
                         fmt='none', ecolor='0.7', elinewidth=0.5, zorder=0)
    axes[1].set_ylabel(r'$v_\mathrm{r}$ [km$\,$s$^{-1}$]')
    axes[1].set_ylim(-vrad_ylim, vrad_ylim)
    axes[1].set_xlabel(r'$\Delta \phi_1$ [deg]')

    axes[1].set_xlim(-phi1_lim, phi1_lim)

    dt_myr = (t_now - t_impact) * 977.8
    noise_str = f', $\\sigma_v$ = {sigma_v:.1f} km/s' if sigma_v > 0 else ', noiseless'
    fig.suptitle(f't = {dt_myr:+.0f} Myr after impact{noise_str}')
    plt.tight_layout()
    return fig, axes

# %%
# ============================================================
#  Self-contained simulation: vary t_impact, t_obs, m_sub, r_s
# ============================================================
#
#  Uses the fixed globals: pot_host, stream, posvel_sat, sel
#  (all defined in earlier cells).

AGAMA_TIME_TO_MYR = 977.8  # 1 agama time unit ≈ 977.8 Myr

def setup_simulation(t_impact, t_obs=0.0, m_sub=2e7, r_sub_fac=1, vrel=150.0,
                     buffer=0.13, N_traj=1000):
    """
    Build the combined MW + subhalo potential and rewind the stream.

    The subhalo has impact parameter b=0 (direct hit) and travels
    perpendicular to the stream velocity at closest approach.

    Parameters
    ----------
    t_impact : float
        Time of closest approach in agama units (absolute).
    t_obs : float
        Observation time in agama units. The subhalo trajectory will
        cover [t_start, t_obs].
    m_sub : float
        Subhalo mass in Msun.
    r_sub_fac : float
        Multiplier on the NFW concentration–mass scale radius.
    vrel : float
        Relative velocity of the subhalo w.r.t. the stream (km/s),
        directed perpendicular to the stream at impact.
    buffer : float
        Time (agama units) before t_impact at which the simulation starts.
    N_traj : int
        Number of points in the subhalo trajectory.

    Returns
    -------
    pot_tot : agama.Potential
        Combined host + subhalo potential.
    stream0 : (N, 6) array
        Stream particles rewound to t_start.
    w0_impact : (6,) array
        Impact-site orbit rewound to t_start (used as progenitor reference).
    t_start : float
        Simulation start time (agama units).
    """
    r_sub = nfw_scale_radius(m_sub)[0].value * r_sub_fac
    t_start = t_impact - buffer

    # --- rewind stream and progenitor to t_start (host-only potential) ---
    stream0_result = agama.orbit(
        potential=pot_host, ic=stream,
        timestart=0.0, time=t_start, trajsize=1)
    stream0_loc = np.vstack(stream0_result[:, 1])

    # --- find where the impact happens ---
    avg_wtoday = stream[sel, :].mean(axis=0)
    w_impact = agama.orbit(
        potential=pot_host, ic=avg_wtoday,
        timestart=0.0, time=t_impact, trajsize=1)[1][0]

    # --- subhalo velocity: stream velocity + vrel across the stream ---
    # Use the orbital angular momentum to define "across":
    # L = r × v is normal to the orbital plane, so cross(L, v) lies
    # in the orbital plane and is perpendicular to v — i.e. radially
    # across the stream width.
    r_stream = w_impact[:3]
    v_stream = w_impact[3:6]
    L = np.cross(r_stream, v_stream)
    perp = np.cross(L, v_stream)
    perp /= np.linalg.norm(perp)

    w_sub = w_impact.copy()
    w_sub[3:6] = v_stream + vrel * perp

    # --- rewind impact point and subhalo to t_start ---
    w0_impact_loc = agama.orbit(
        potential=pot_host, ic=w_impact,
        timestart=t_impact, time=(t_start - t_impact), trajsize=1)[1][0]

    w0_sub_loc = agama.orbit(
        potential=pot_host, ic=w_sub,
        timestart=t_impact, time=(t_start - t_impact), trajsize=1)[1][0]

    # --- subhalo trajectory from t_start to t_obs ---
    traj_sub_loc = np.column_stack(agama.orbit(
        potential=pot_host, ic=w0_sub_loc,
        timestart=t_start, time=t_obs - t_start, trajsize=N_traj))

    # --- build combined potential ---
    pot_sub_loc = agama.Potential(
        type='nfw', mass=m_sub, scaleRadius=r_sub, center=traj_sub_loc)
    pot_tot_loc = agama.Potential(pot_host, pot_sub_loc)

    return pot_tot_loc, stream0_loc, w0_impact_loc, t_start


def evolve_to(pot_tot_loc, stream0_loc, w0_impact_loc, t_start, t_obs, t_impact_abs):
    """
    Integrate the perturbed stream to t_obs and return observables.

    Returns
    -------
    phi1, phi2, vrad : arrays
        Stream coordinates and Galactocentric radial velocity (km/s).
    nearest_mask : boolean array
        Stars that were closest to the impact site at the time of impact.
    """
    # evolve stream to impact time to find nearest stars
    pstream_at_impact = agama.orbit(
        potential=pot_tot_loc, ic=stream0_loc,
        timestart=t_start, time=t_impact_abs - t_start, trajsize=1)
    pstream_at_impact = np.vstack(pstream_at_impact[:, 1])

    impact_loc = agama.orbit(
        potential=pot_host, ic=w0_impact_loc,
        timestart=t_start, time=t_impact_abs - t_start, trajsize=1)[1][0]

    dist_at_impact = np.linalg.norm(pstream_at_impact[:, :3] - impact_loc[:3], axis=1)
    nearest_mask = np.zeros(len(stream0_loc), dtype=bool)
    nearest_mask[np.argsort(dist_at_impact)[:50]] = True

    # now evolve stream to observation time
    pstream = agama.orbit(
        potential=pot_tot_loc, ic=stream0_loc,
        timestart=t_start, time=t_obs - t_start, trajsize=1)
    pstream = np.vstack(pstream[:, 1])

    prog = agama.orbit(
        potential=pot_host, ic=w0_impact_loc,
        timestart=t_start, time=t_obs - t_start, trajsize=1)[1][0]

    phi1, phi2, vrad = get_obs(pstream, prog)
    phi1 = np.array(phi1)
    phi2 = np.array(phi2)
    vrad = np.array(vrad)

    return phi1, phi2, vrad, nearest_mask


def plot_snapshot(t_impact, t_obs=0.0, m_sub=2e7, r_sub_fac=1, vrel=150.0,
                  sigma_v=0.0, phi1_lim=21, phi2_ylim=1.5, vrad_ylim=7,
                  noise_seed=42, buffer=0.1, n_bins=30):
    """
    End-to-end: set up impact, evolve, detrend, and plot.

    Parameters
    ----------
    t_impact : float
        Time of impact relative to t_obs (agama units, negative = before observation).
    t_obs : float
        Observation time (agama units, 0 = present day).
    m_sub : float
        Subhalo mass (Msun).
    r_sub_fac : float
        Multiplier on NFW scale radius.
    vrel : float
        Relative velocity of subhalo perpendicular to stream (km/s).
    sigma_v : float
        Gaussian velocity noise (km/s). 0 = noiseless.
    """
    # t_impact is relative to t_obs; convert to absolute agama time
    t_impact_abs = t_obs + t_impact

    pot_tot_loc, stream0_loc, w0_impact_loc, t_start = setup_simulation(
        t_impact_abs, t_obs=t_obs, m_sub=m_sub, r_sub_fac=r_sub_fac, vrel=vrel, buffer=buffer)

    phi1, phi2, vrad, nearest_mask = evolve_to(
        pot_tot_loc, stream0_loc, w0_impact_loc, t_start, t_obs, t_impact_abs)

    # add velocity noise
    if sigma_v > 0:
        rng = np.random.default_rng(noise_seed)
        vrad = vrad + rng.normal(scale=sigma_v, size=len(vrad))

    # detrend vrad: median in phi1 bins, then smooth spline through medians
    phi1_sorted = np.sort(phi1)
    bin_edges = np.linspace(phi1_sorted[0], phi1_sorted[-1], n_bins + 1)
    bin_centers = 0.5 * (bin_edges[:-1] + bin_edges[1:])
    bin_idx = np.digitize(phi1, bin_edges) - 1
    bin_idx = np.clip(bin_idx, 0, n_bins - 1)

    from scipy.interpolate import UnivariateSpline

    def robust_detrend(y):
        medians = np.array([np.median(y[bin_idx == i]) if np.sum(bin_idx == i) > 0
                            else np.nan for i in range(n_bins)])
        good = ~np.isnan(medians)
        spl = UnivariateSpline(bin_centers[good], medians[good], k=4, s=len(medians[good]) * 10)
        return y - spl(phi1), spl, medians, good

    fig, axes = plt.subplots(2, 1, sharex=True, figsize=(8, 5))

    # phi1 vs phi2 (no detrending)
    axes[0].scatter(phi1[~nearest_mask], phi2[~nearest_mask], s=1, color='k', rasterized=True)
    axes[0].scatter(phi1[nearest_mask], phi2[nearest_mask], s=4, color='r', zorder=5)
    axes[0].set_ylabel(r'$\phi_2$ [deg]')
    axes[0].set_ylim(-phi2_ylim, phi2_ylim)

    # phi1 vs detrended vrad
    dvrad, spl_vrad, med_vrad, good_vrad = robust_detrend(vrad)
    axes[1].scatter(phi1, dvrad, s=1, color='k', rasterized=True)
    # axes[1].scatter(phi1[nearest_mask], dvrad[nearest_mask], s=4, color='r', zorder=5)
    if sigma_v > 0:
        axes[1].errorbar(phi1, dvrad, yerr=sigma_v,
                         fmt='none', ecolor='0.7', elinewidth=0.5, zorder=0)
    axes[1].set_ylabel(r'$v_\mathrm{r}$ [km$\,$s$^{-1}$]')
    axes[1].set_ylim(-vrad_ylim, vrad_ylim)
    axes[1].set_xlabel(r'$\phi_1$ [deg]')

    axes[1].set_xlim(-phi1_lim, phi1_lim)

    # title with physical times
    t_since_myr = -t_impact * AGAMA_TIME_TO_MYR  # positive = Myr since impact
    noise_str = f', $\\sigma_v$ = {sigma_v:.1f} km/s' if sigma_v > 0 else ''
    # fig.suptitle(
    #     f'$\\log M_\\mathrm{{sub}}$ = {np.log10(m_sub):.1f}, '
    #     f'$r_s$ × {r_sub_fac}, '
    #     f'{t_since_myr:.0f} Myr after impact'
    #     f'{noise_str}')
    plt.tight_layout()

    # diagnostic: raw data + spline + bin medians
    phi1_fine = np.linspace(phi1_sorted[0], phi1_sorted[-1], 300)

    fig_diag, ax_diag = plt.subplots(2, 1, sharex=True, figsize=(10, 6))

    ax_diag[0].scatter(phi1, phi2, s=1, color='0.5', alpha=0.3, rasterized=True)
    ax_diag[0].set_ylabel(r'$\phi_2$ [deg]')

    ax_diag[1].scatter(phi1, vrad, s=1, color='0.5', alpha=0.3, rasterized=True)
    ax_diag[1].scatter(bin_centers[good_vrad], med_vrad[good_vrad], s=30, color='C0',
                       edgecolor='k', lw=0.5, zorder=5, label='bin medians')
    ax_diag[1].plot(phi1_fine, spl_vrad(phi1_fine), 'C3', lw=2, label='spline fit')
    ax_diag[1].set_ylabel(r'$v_\mathrm{r}$ [km$\,$s$^{-1}$]')
    ax_diag[1].set_xlabel(r'$\Delta \phi_1$ [deg]')
    ax_diag[1].legend(fontsize=8)

    fig_diag.suptitle('Detrending diagnostic: raw data + spline')
    fig_diag.tight_layout()

    return fig, axes, fig_diag, phi1, phi2, dvrad

# %%
t_obs = 0.04
vrel = 100

plot_snapshot(t_impact=-0.1, t_obs=t_obs,
                    m_sub=1e7, sigma_v=5, vrel = vrel,
                    phi1_lim = 21, r_sub_fac=1)

# %%
# --- Generate unperturbed stream (M_sub = 0) and define phi1_0 ---
# Evolve stream under pot_host only. The median phi1 of this run
# becomes the global zero-point for ALL simulations (perturbed and unperturbed).
from scipy.interpolate import UnivariateSpline

t_obs_grid = t_obs
vrel_grid = vrel

stream_at_obs = agama.orbit(
    potential=pot_host, ic=stream,
    timestart=0.0, time=t_obs, trajsize=1)
stream_at_obs = np.vstack(stream_at_obs[:, 1])

avg_wtoday = stream[sel, :].mean(axis=0)
prog_unp = agama.orbit(
    potential=pot_host, ic=avg_wtoday,
    timestart=0.0, time=t_obs, trajsize=1)[1][0]

phi1_unp, phi2_unp, vrad_unp = get_obs(stream_at_obs, prog_unp)
phi1_unp = np.array(phi1_unp)
phi2_unp = np.array(phi2_unp)
vrad_unp = np.array(vrad_unp)

# no phi1 recentering — plot raw phi1

# detrend vrad with spline
n_bins_unp = 30
phi1_sorted_unp = np.sort(phi1_unp)
bin_edges_unp = np.linspace(phi1_sorted_unp[0], phi1_sorted_unp[-1], n_bins_unp + 1)
bin_centers_unp = 0.5 * (bin_edges_unp[:-1] + bin_edges_unp[1:])
bin_idx_unp = np.clip(np.digitize(phi1_unp, bin_edges_unp) - 1, 0, n_bins_unp - 1)

medians_unp = np.array([np.median(vrad_unp[bin_idx_unp == i]) if np.sum(bin_idx_unp == i) > 0
                         else np.nan for i in range(n_bins_unp)])
good_unp = ~np.isnan(medians_unp)
spl_unp = UnivariateSpline(bin_centers_unp[good_unp], medians_unp[good_unp], k=4, s=len(medians_unp[good_unp]) * 10)
dvrad_unp = vrad_unp - spl_unp(phi1_unp)

unperturbed = {
    'phi1': phi1_unp,
    'phi2': phi2_unp,
    'dvrad': dvrad_unp,
}
print(f'Unperturbed stream: {len(phi1_unp)} particles')

# %%
# --- Parameter grid ---
import itertools

msub_grid = np.logspace(7, 8, 5)  # linear in log(M) between 10^7 and 10^8
r_sub_fac_grid = [0.5, 1.0, 2.0]
t_impact_myr_grid = np.array([-150, -100, -50, -1e-2])  # 0 replaced with -0.01 to avoid exact zero
t_impact_agama_grid = t_impact_myr_grid / AGAMA_TIME_TO_MYR

grid = list(itertools.product(msub_grid, r_sub_fac_grid, t_impact_agama_grid))
print(f'{len(msub_grid)} masses × {len(r_sub_fac_grid)} r_sub_fac × {len(t_impact_agama_grid)} t_impact = {len(grid)} grid points')
print(f't_impact (Myr): {t_impact_myr_grid}')

# %%
# --- Generate snapshots for the full grid ---
results = {}

for i, (m_sub, r_sub_fac, t_imp) in enumerate(tqdm(grid)):
    fig, axes, fig_diag, phi1_out, dphi2_out, dvrad_out = plot_snapshot(
        t_impact=t_imp, t_obs=t_obs_grid,
        m_sub=m_sub, r_sub_fac=r_sub_fac, vrel=vrel_grid,
        sigma_v=0.0)
    plt.close(fig)
    plt.close(fig_diag)

    results[(m_sub, r_sub_fac, t_imp)] = {
        'phi1': np.array(phi1_out),
        'dphi2': np.array(dphi2_out),
        'dvrad': np.array(dvrad_out),
    }

print(f'Done: {len(results)} snapshots generated')

# %%
# --- Save results as JSON for the website ---
import json
from pathlib import Path

outdir = Path('.')  # sim_data directory
decimals = 3

# delete all existing json files
for f in outdir.glob('*.json'):
    f.unlink()
print(f'Cleaned {outdir.resolve()}')

# write from the results dict
saved = 0
for (m_sub, r_sub_fac, t_imp), res in results.items():
    t_imp_myr = t_imp * AGAMA_TIME_TO_MYR
    logm = np.log10(m_sub)

    data = {
        'params': {
            'logm': round(logm, 1),
            'rmult': r_sub_fac,
            't_impact_myr': round(float(t_imp_myr), 1),
            'vrel': vrel_grid,
            't_obs_agama': t_obs_grid,
        },
        'data': {
            'phi1': np.round(res['phi1'], decimals).tolist(),
            'phi2': np.round(res['dphi2'], decimals).tolist(),
            'vrad': np.round(res['dvrad'], decimals).tolist(),
        }
    }

    timp_label = int(round(t_imp_myr))
    fname = f'logm-{logm:.1f}_rmult-{r_sub_fac}_timp-{timp_label}.json'
    with open(outdir / fname, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    saved += 1

# save unperturbed stream
unp_data = {
    'params': {'logm': None, 'rmult': None, 't_impact_myr': None},
    'data': {
        'phi1': np.round(unperturbed['phi1'], decimals).tolist(),
        'phi2': np.round(unperturbed['phi2'], decimals).tolist(),
        'vrad': np.round(unperturbed['dvrad'], decimals).tolist(),
    }
}
with open(outdir / 'unperturbed.json', 'w') as f:
    json.dump(unp_data, f, separators=(',', ':'))
saved += 1

print(f'Saved {saved} JSON files to {outdir.resolve()}')

# %%

