#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#else
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#endif

#if __has_include(<StripeTerminal/StripeTerminal.h>)
#import <StripeTerminal/StripeTerminal.h>
#else
#import "StripeTerminal.h"
#endif

@interface RNStripeTerminal : RCTEventEmitter <RCTBridgeModule, SCPConnectionTokenProvider, SCPDiscoveryDelegate, SCPReaderDisplayDelegate, SCPTerminalDelegate, SCPReaderSoftwareUpdateDelegate> {

    NSArray<SCPReader *> *readers;
    SCPReader *reader;
    SCPPaymentIntent *intent;
    SCPReaderSoftwareUpdate *update;
    SCPCancelable *pendingCreatePaymentIntent;
    SCPCancelable *pendingDiscoverReaders;
    SCPCancelable *pendingInstallUpdate;
    SCPConnectionTokenCompletionBlock pendingConnectionTokenCompletionBlock;
    SCPReaderEvent lastReaderEvent;
}

@end
