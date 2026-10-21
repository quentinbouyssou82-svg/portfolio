r"""
Container classes for `.Artist`\s.

`OffsetBox`
    The base of all container artists defined in this module.

`AnchoredOffsetbox`, `AnchoredText`
    Anchor and align an arbitrary `.Artist` or a text relative to the parent
    axes or a specific anchor point.

`DrawingArea`
    A container with fixed width and height. Children have a fixed position
    inside the container and may be clipped.

`HPacker`, `VPacker`
    Containers for layouting their children vertically or horizontally.

`PaddedBox`
    A container to add a padding around an `.Artist`.

`TextArea`
    Contains a single `.Text` instance.
"""

import functools

import numpy as np

import matplotlib as mpl
from matplotlib import _api, _docstring
import matplotlib.artist as martist
import matplotlib.path as mpath
import matplotlib.text as mtext
import matplotlib.transforms as mtransforms
from matplotlib.font_manager import FontProperties
from matplotlib.image import BboxImage
from matplotlib.patches import (
    FancyBboxPatch, FancyArrowPatch, bbox_artist as mbbox_artist)
from matplotlib.transforms import Bbox, BboxBase, TransformedBbox


DEBUG = False


def _compat_get_offset(meth):
    """
    Decorator for the get_offset method of OffsetBox and subclasses, that
    allows supporting both the new signature (self, bbox, renderer) and the old
    signature (self, width, height, xdescent, ydescent, renderer).
    """
    sigs = [lambda self, width, height, xdescent, ydescent, renderer: locals(),
            lambda self, bbox, renderer: locals()]

    @functools.wraps(meth)
    def get_offset(self, *args, **kwargs):
        params = _api.select_matching_signature(sigs, self, *args, **kwargs)
        bbox = (params["bbox"] if "bbox" in params else
                Bbox.from_bounds(-params["xdescent"], -params["ydescent"],
                                 params["width"], params["height"]))
        return meth(params["self"], bbox, params["renderer"])
    return get_offset


# for debugging use
def _bbox_artist(*args, **kwargs):
    if DEBUG:
        mbbox_artist(*args, **kwargs)


def _get_packed_offsets(widths, total, sep, mode="fixed"):
    r"""
    Pack boxes specified by their *widths*.

    For simplicity of the description, the terminology used here assumes a
    horizontal layout, but the function works equally for a vertical layout.

    There are three packing *mode*\s:

    - 'fixed': The elements are packed tight to the left with a spacing of
      *sep* in between. If *total* is *None* the returned total will be the
      right edge of the last box. A non-*None* total will be passed unchecked
      to the output. In particular this means that right edge of the last
      box may be further to the right than the returned total.

    - 'expand': Distribute the boxes with equal spacing so that the left edge
      of the first box is at 0, and the right edge of the last box is at
      *total*. The parameter *sep* is ignored in this mode. A total of *None*
      is accepted and considered equal to 1. The total is returned unchanged
      (except for the conversion *None* to 1). If the total is smaller than
      the sum of the widths, the laid out boxes will overlap.

    - 'equal': If *total* is given, the total space 