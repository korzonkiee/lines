CC=$(CROSS_COMPILE)gcc
OBJS := mytimer.o
mytimer: $(OBJS)
	$(CC) -o mytimer $(OBJS)
$(OBJS) : %.o : %.c
	$(CC) -c $(CFLAGS) $< -o $@ -g3