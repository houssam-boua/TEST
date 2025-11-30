# backend/users/templatetags/perm_tags.py
# Purpose: Template tags for checking any/all permissions in Django templates.
from __future__ import annotations

from typing import Any
from django import template
from django.template import Node, TemplateSyntaxError
from django.utils.safestring import mark_safe

register = template.Library()


class IfAnyPermNode(Node):
    def __init__(self, user_var, perms, nodelist_true, nodelist_false=None):
        self.user_var = template.Variable(user_var)
        self.perms = perms
        self.nodelist_true = nodelist_true
        self.nodelist_false = nodelist_false

    def render(self, context: Any) -> str:
        try:
            user = self.user_var.resolve(context)
        except template.VariableDoesNotExist:
            return ""
        try:
            perms = [p.strip().strip('"').strip("'") for p in self.perms]
            # prefer user method if available
            if hasattr(user, "has_any_permission"):
                ok = user.has_any_permission(perms)
            else:
                from ..utils import has_any_permission
                ok = has_any_permission(user, perms)
        except Exception:
            ok = False
        return self.nodelist_true.render(context) if ok else (self.nodelist_false.render(context) if self.nodelist_false else "")


class IfAllPermNode(Node):
    def __init__(self, user_var, perms, nodelist_true, nodelist_false=None):
        self.user_var = template.Variable(user_var)
        self.perms = perms
        self.nodelist_true = nodelist_true
        self.nodelist_false = nodelist_false

    def render(self, context: Any) -> str:
        try:
            user = self.user_var.resolve(context)
        except template.VariableDoesNotExist:
            return ""
        try:
            perms = [p.strip().strip('"').strip("'") for p in self.perms]
            if hasattr(user, "has_all_permissions"):
                ok = user.has_all_permissions(perms)
            else:
                from ..utils import has_all_permissions
                ok = has_all_permissions(user, perms)
        except Exception:
            ok = False
        return self.nodelist_true.render(context) if ok else (self.nodelist_false.render(context) if self.nodelist_false else "")


@register.tag
def if_any_perm(parser, token):
    """
    Usage:
        {% if_any_perm user "app.perm1" "app.perm2" %}
            ...
        {% endif_any_perm %}
    """
    bits = token.split_contents()
    if len(bits) < 3:
        raise TemplateSyntaxError("if_any_perm requires at least a user and one permission")
    user_var = bits[1]
    perms = bits[2:]
    nodelist_true = parser.parse(("endif_any_perm",))
    parser.delete_first_token()
    return IfAnyPermNode(user_var, perms, nodelist_true)


@register.tag
def if_all_perm(parser, token):
    """
    Usage:
        {% if_all_perm user "app.perm1" "app.perm2" %}
            ...
        {% endif_all_perm %}
    """
    bits = token.split_contents()
    if len(bits) < 3:
        raise TemplateSyntaxError("if_all_perm requires at least a user and one permission")
    user_var = bits[1]
    perms = bits[2:]
    nodelist_true = parser.parse(("endif_all_perm",))
    parser.delete_first_token()
    return IfAllPermNode(user_var, perms, nodelist_true)