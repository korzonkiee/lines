#####################################################################
# mytimer
#####################################################################

LAB2_VERSION = 1.0
LAB2_SITE = /home/samba/korzeniewskim/Documents/lines/mytimer
LAB2_SITE_METHOD = local
define LAB2_BUILD_CMDS
 $(MAKE) $(TARGET_CONFIGURE_OPTS) mytimer -C $(@D)
endef
define LAB2_INSTALL_TARGET_CMDS
 $(INSTALL) -D -m 0755 $(@D)/mytimer $(TARGET_DIR)/usr/bin
endef
LAB2_LICENSE = GPL
$(eval $(generic-package))