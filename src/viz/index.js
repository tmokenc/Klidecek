// src/viz/index.js — viz registry barrel.
//
// To add a new interactive visualisation:
//   1. Create a JSX file in this directory that default-exports a React component.
//   2. Import it here and call `register("<id>", Component)`.
//   3. Reference it from any markdown file with:  ::: viz <id> "optional caption"
//
// The string id is what authors type in markdown. Keep it short, lowercase, stable.

import { register } from "../framework/viz-registry.js";

import Rasterize from "./rasterize.jsx";
import Ray from "./ray.jsx";
import BFS from "./bfs.jsx";
import BTree from "./btree.jsx";
import Handshake from "./handshake.jsx";
import BiasVar from "./biasvar.jsx";
import PisMonoVsMicro from "./pis-mono-vs-micro.jsx";
import CdiScopes from "./cdi-scopes.jsx";
import JpaInheritance from "./jpa-inheritance.jsx";
import OAuth2Flow from "./oauth2-flow.jsx";
import Benes from "./benes.jsx";
import Clos from "./clos.jsx";
import HolVoq from "./holvoq.jsx";
import Dijkstra from "./dijkstra.jsx";
import Kademlia from "./kademlia.jsx";
import HiCuts from "./hicuts.jsx";
import CountToInf from "./count-to-inf.jsx";
import ISlip from "./islip.jsx";
import AIMD from "./aimd.jsx";
import P2POverlay from "./p2p-overlay.jsx";
import OlapCube from "./olap-cube.jsx";
import JpaLifecycle from "./jpa-lifecycle.jsx";
import JpaNplus1 from "./jpa-nplus1.jsx";
import TwoPhaseCommit from "./two-phase-commit.jsx";
import Saga from "./saga.jsx";
import WorkflowPatterns from "./workflow-patterns.jsx";
import RecoverableQueue from "./recoverable-queue.jsx";
import NfaToDfa from "./nfa-to-dfa.jsx";
import AmdahlGustafson from "./amdahl-gustafson.jsx";
import BroadcastRedukce from "./broadcast-redukce.jsx";
import PrefixSumUvod from "./prefix-sum-uvod.jsx";
import PrefixSumAlgoritmus from "./prefix-sum-algoritmus.jsx";
import EulerTour from "./euler-tour.jsx";
import KontrakceUvod from "./kontrakce-uvod.jsx";
import TranspositionEnumeration from "./transposition-enumeration.jsx";
import MergeRadici from "./merge-radici.jsx";
import NasobeniMaticMesh from "./nasobeni-matic-mesh.jsx";
import VolbaMaster from "./volba-master.jsx";
import RaftPraxe from "./raft-praxe.jsx";
import EnumerationSort from "./enumeration-sort.jsx";
import MinExtractionSort from "./min-extraction-sort.jsx";
import MedianSplitting from "./median-splitting.jsx";
import ListRanking from "./list-ranking.jsx";
import OmegaNetwork from "./omega-network.jsx";
import CaesarShift from "./caesar-shift.jsx";
import TmSimulator from "./tm-simulator.jsx";
import PdaStack from "./pda-stack.jsx";
import CfgDerivation from "./cfg-derivation.jsx";
import CykParsing from "./cyk-parsing.jsx";
import DfaMinimization from "./dfa-minimization.jsx";
import PumpingLemma from "./pumping-lemma.jsx";
import MasterTheorem from "./master-theorem.jsx";
import ReductionWiring from "./reduction-wiring.jsx";
import SatClique from "./sat-clique.jsx";
import ChomskyHierarchy from "./chomsky-hierarchy.jsx";
import VigenereAttack from "./vigenere-attack.jsx";
import FreqAnalysis from "./freq-analysis.jsx";
import Enigma from "./enigma.jsx";
import EcbTux from "./ecb-tux.jsx";
import Feistel from "./feistel.jsx";
import AesRound from "./aes-round.jsx";
import DhMitm from "./dh-mitm.jsx";
import EcPointAdd from "./ec-point-add.jsx";
import RsaToy from "./rsa-toy.jsx";
import PaddingOracle from "./padding-oracle.jsx";
import BirthdayParadox from "./birthday-paradox.jsx";
import MerkleDamgard from "./merkle-damgard.jsx";
import Sponge from "./sponge.jsx";
import KerberosViz from "./kerberos.jsx";
import NeedhamSchroeder from "./needham-schroeder.jsx";
import EcdsaNonceReuse from "./ecdsa-nonce-reuse.jsx";
import HillCipher from "./hill-cipher.jsx";
import Playfair from "./playfair.jsx";
import RotorPeriod from "./rotor-period.jsx";
import ColumnarTransposition from "./columnar-transposition.jsx";
import OtpCribDrag from "./otp-crib-drag.jsx";
import Tls13Handshake from "./tls13-handshake.jsx";
import PollardRho from "./pollard-rho.jsx";
import SquareAndMultiply from "./square-and-multiply.jsx";
import HmacStructure from "./hmac-structure.jsx";
import LsbSteganografie from "./lsb-steganografie.jsx";
import LfsrExplorer from "./lfsr-explorer.jsx";
import A51Clocking from "./a51-clocking.jsx";
import NistTestPlayground from "./nist-test-playground.jsx";
import ArbiterPuf from "./arbiter-puf.jsx";
import RsaSpaTrace from "./rsa-spa-trace.jsx";
import DpaAesSbox from "./dpa-aes-sbox.jsx";
import DfaAesRound from "./dfa-aes-round.jsx";
import BellcoreRsaCrt from "./bellcore-rsa-crt.jsx";
import DecimalizationAttack from "./decimalization-attack.jsx";
import EmvShim from "./emv-shim.jsx";
import TimingPassword from "./timing-password.jsx";
import BooleanMasking from "./boolean-masking.jsx";
import TamperResponse from "./tamper-response.jsx";
import ApduBuilder from "./apdu-builder.jsx";
import NfcAnticollision from "./nfc-anticollision.jsx";
import BacEntropy from "./bac-entropy.jsx";
import GlitchPin from "./glitch-pin.jsx";
import Pkcs11Wrap from "./pkcs11-wrap.jsx";
import LorawanCounter from "./lorawan-counter.jsx";
import ZigbeeDefaultKey from "./zigbee-default-key.jsx";
import BleCrackle from "./ble-crackle.jsx";
import KeeloqWindow from "./keeloq-window.jsx";
import SinkholeMesh from "./sinkhole-mesh.jsx";
import WormholeTunnel from "./wormhole-tunnel.jsx";
import CfgFlatten from "./cfg-flatten.jsx";
import LinuxRngBoot from "./linux-rng-boot.jsx";
import SybilQuorum from "./sybil-quorum.jsx";
import ScoreDistributions from "./score-distributions.jsx";
import RocDetExplorer from "./roc-det-explorer.jsx";
import MinutiaeMatching from "./minutiae-matching.jsx";
import DaugmanIrisCode from "./daugman-iris-code.jsx";
import EigenfacesRecon from "./eigenfaces-recon.jsx";
import StrProfileMatch from "./str-profile-match.jsx";
import KeystrokeRhythm from "./keystroke-rhythm.jsx";
import EpassportHandshake from "./epassport-handshake.jsx";
import AttackPoints7 from "./attack-points-7.jsx";
import VeinNirSpectrum from "./vein-nir-spectrum.jsx";
import ArcfaceMargin from "./arcface-margin.jsx";
import ViolaJonesCascade from "./viola-jones-cascade.jsx";
import HenryPatternClassifier from "./henry-pattern-classifier.jsx";
import GaborRidgeEnhance from "./gabor-ridge-enhance.jsx";
import DnaElectropherogram from "./dna-electropherogram.jsx";
import GaitCycleWalker from "./gait-cycle-walker.jsx";
import SignatureDynamic from "./signature-dynamic.jsx";
import VoiceMfcc from "./voice-mfcc.jsx";
import LivenessPadTradeoff from "./liveness-pad-tradeoff.jsx";
import DeepfakeDetection from "./deepfake-detection.jsx";
import IcaoLdsExplorer from "./icao-lds-explorer.jsx";
import BacPaceKeys from "./bac-pace-keys.jsx";

register("rasterize",         Rasterize);
register("ray",               Ray);
register("bfs",               BFS);
register("btree",             BTree);
register("handshake",         Handshake);
register("biasvar",           BiasVar);
register("pis-mono-vs-micro", PisMonoVsMicro);
register("cdi-scopes",        CdiScopes);
register("jpa-inheritance",   JpaInheritance);
register("oauth2-flow",       OAuth2Flow);
register("benes",             Benes);
register("clos",              Clos);
register("hol-voq",           HolVoq);
register("dijkstra",          Dijkstra);
register("kademlia",          Kademlia);
register("hicuts",            HiCuts);
register("count-to-inf",      CountToInf);
register("islip",             ISlip);
register("aimd",              AIMD);
register("p2p-overlay",       P2POverlay);
register("olap-cube",         OlapCube);
register("jpa-lifecycle",     JpaLifecycle);
register("jpa-nplus1",        JpaNplus1);
register("two-phase-commit",  TwoPhaseCommit);
register("saga",              Saga);
register("workflow-patterns", WorkflowPatterns);
register("recoverable-queue", RecoverableQueue);
register("nfa-to-dfa",        NfaToDfa);
register("amdahl-gustafson",  AmdahlGustafson);
register("broadcast-redukce", BroadcastRedukce);
register("prefix-sum-uvod",   PrefixSumUvod);
register("prefix-sum-algoritmus", PrefixSumAlgoritmus);
register("euler-tour",        EulerTour);
register("kontrakce-uvod",    KontrakceUvod);
register("transposition-enumeration", TranspositionEnumeration);
register("merge-radici",      MergeRadici);
register("nasobeni-matic-mesh", NasobeniMaticMesh);
register("volba-master",      VolbaMaster);
register("raft-praxe",        RaftPraxe);
register("enumeration-sort", EnumerationSort);
register("min-extraction-sort", MinExtractionSort);
register("median-splitting", MedianSplitting);
register("list-ranking", ListRanking);
register("omega-network", OmegaNetwork);
register("caesar-shift", CaesarShift);
register("tm-simulator", TmSimulator);
register("pda-stack", PdaStack);
register("cfg-derivation", CfgDerivation);
register("cyk-parsing", CykParsing);
register("dfa-minimization", DfaMinimization);
register("pumping-lemma", PumpingLemma);
register("master-theorem", MasterTheorem);
register("reduction-wiring", ReductionWiring);
register("sat-clique", SatClique);
register("chomsky-hierarchy", ChomskyHierarchy);
register("vigenere-attack", VigenereAttack);
register("freq-analysis", FreqAnalysis);
register("enigma", Enigma);
register("ecb-tux", EcbTux);
register("feistel", Feistel);
register("aes-round", AesRound);
register("dh-mitm", DhMitm);
register("ec-point-add", EcPointAdd);
register("rsa-toy", RsaToy);
register("padding-oracle", PaddingOracle);
register("birthday-paradox", BirthdayParadox);
register("merkle-damgard", MerkleDamgard);
register("sponge", Sponge);
register("kerberos", KerberosViz);
register("needham-schroeder", NeedhamSchroeder);
register("ecdsa-nonce-reuse", EcdsaNonceReuse);
register("hill-cipher", HillCipher);
register("playfair", Playfair);
register("rotor-period", RotorPeriod);
register("columnar-transposition", ColumnarTransposition);
register("otp-crib-drag", OtpCribDrag);
register("tls13-handshake", Tls13Handshake);
register("pollard-rho", PollardRho);
register("square-and-multiply", SquareAndMultiply);
register("hmac-structure", HmacStructure);
register("lsb-steganografie", LsbSteganografie);
register("lfsr-explorer", LfsrExplorer);
register("a51-clocking", A51Clocking);
register("nist-test-playground", NistTestPlayground);
register("arbiter-puf", ArbiterPuf);
register("rsa-spa-trace", RsaSpaTrace);
register("dpa-aes-sbox", DpaAesSbox);
register("dfa-aes-round", DfaAesRound);
register("bellcore-rsa-crt", BellcoreRsaCrt);
register("decimalization-attack", DecimalizationAttack);
register("emv-shim", EmvShim);
register("timing-password", TimingPassword);
register("boolean-masking", BooleanMasking);
register("tamper-response", TamperResponse);
register("apdu-builder", ApduBuilder);
register("nfc-anticollision", NfcAnticollision);
register("bac-entropy", BacEntropy);
register("glitch-pin", GlitchPin);
register("pkcs11-wrap", Pkcs11Wrap);
register("lorawan-counter", LorawanCounter);
register("zigbee-default-key", ZigbeeDefaultKey);
register("ble-crackle", BleCrackle);
register("keeloq-window", KeeloqWindow);
register("sinkhole-mesh", SinkholeMesh);
register("wormhole-tunnel", WormholeTunnel);
register("cfg-flatten", CfgFlatten);
register("linux-rng-boot", LinuxRngBoot);
register("sybil-quorum", SybilQuorum);
register("score-distributions", ScoreDistributions);
register("roc-det-explorer", RocDetExplorer);
register("minutiae-matching", MinutiaeMatching);
register("daugman-iris-code", DaugmanIrisCode);
register("eigenfaces-recon", EigenfacesRecon);
register("str-profile-match", StrProfileMatch);
register("keystroke-rhythm", KeystrokeRhythm);
register("epassport-handshake", EpassportHandshake);
register("attack-points-7", AttackPoints7);
register("vein-nir-spectrum", VeinNirSpectrum);
register("arcface-margin", ArcfaceMargin);
register("viola-jones-cascade", ViolaJonesCascade);
register("henry-pattern-classifier", HenryPatternClassifier);
register("gabor-ridge-enhance", GaborRidgeEnhance);
register("dna-electropherogram", DnaElectropherogram);
register("gait-cycle-walker", GaitCycleWalker);
register("signature-dynamic", SignatureDynamic);
register("voice-mfcc", VoiceMfcc);
register("liveness-pad-tradeoff", LivenessPadTradeoff);
register("deepfake-detection", DeepfakeDetection);
register("icao-lds-explorer", IcaoLdsExplorer);
register("bac-pace-keys", BacPaceKeys);

// FLP — lambda kalkul
import LambdaReducer from "./lambda-reducer.jsx";
import ChurchNumerals from "./church-numerals.jsx";
import YCombinator from "./y-combinator.jsx";
import ChurchRosserConverge from "./church-rosser-converge.jsx";
import EtaPointfree from "./eta-pointfree.jsx";

// FLP — Haskell základy
import HindleyMilner from "./hindley-milner.jsx";
import LazyThunkGraph from "./lazy-thunk-graph.jsx";
import AdtPatternMatch from "./adt-pattern-match.jsx";
import FunctorApplicativeMonad from "./functor-applicative-monad.jsx";
import TypeClassDispatch from "./type-class-dispatch.jsx";
import SieveLazy from "./sieve-lazy.jsx";

// FLP — Haskell pokročilé
import MonadBindFlow from "./monad-bind-flow.jsx";
import HofPipeline from "./hof-pipeline.jsx";
import CurryingPartial from "./currying-partial.jsx";
import FoldComparison from "./fold-comparison.jsx";
import MaybeEitherChain from "./maybe-either-chain.jsx";

// FLP — Prolog
import PrologUnifyTree from "./prolog-unify-tree.jsx";
import PrologSldTree from "./prolog-sld-tree.jsx";
import DcgParser from "./dcg-parser.jsx";
import ClpNqueens from "./clp-nqueens.jsx";
import PrologFindallBagofSetof from "./prolog-findall-bagof-setof.jsx";

// FLP — Rust
import OwnershipFlow from "./ownership-flow.jsx";
import LifetimeVisualizer from "./lifetime-visualizer.jsx";
import RustIteratorChain from "./rust-iterator-chain.jsx";
import RustResultChain from "./rust-result-chain.jsx";
import NllBorrow from "./nll-borrow.jsx";
import ClosureCaptureModes from "./closure-capture-modes.jsx";
import RustVsHaskell from "./rust-vs-haskell.jsx";
import SmartPointerGraph from "./smart-pointer-graph.jsx";
import TraitMonomorphization from "./trait-monomorphization.jsx";

register("lambda-reducer", LambdaReducer);
register("church-numerals", ChurchNumerals);
register("y-combinator", YCombinator);
register("church-rosser-converge", ChurchRosserConverge);
register("eta-pointfree", EtaPointfree);

register("hindley-milner", HindleyMilner);
register("lazy-thunk-graph", LazyThunkGraph);
register("adt-pattern-match", AdtPatternMatch);
register("functor-applicative-monad", FunctorApplicativeMonad);
register("type-class-dispatch", TypeClassDispatch);
register("sieve-lazy", SieveLazy);

register("monad-bind-flow", MonadBindFlow);
register("hof-pipeline", HofPipeline);
register("currying-partial", CurryingPartial);
register("fold-comparison", FoldComparison);
register("maybe-either-chain", MaybeEitherChain);

register("prolog-unify-tree", PrologUnifyTree);
register("prolog-sld-tree", PrologSldTree);
register("dcg-parser", DcgParser);
register("clp-nqueens", ClpNqueens);
register("prolog-findall-bagof-setof", PrologFindallBagofSetof);

register("ownership-flow", OwnershipFlow);
register("lifetime-visualizer", LifetimeVisualizer);
register("rust-iterator-chain", RustIteratorChain);
register("rust-result-chain", RustResultChain);
register("nll-borrow", NllBorrow);
register("closure-capture-modes", ClosureCaptureModes);
register("rust-vs-haskell", RustVsHaskell);
register("smart-pointer-graph", SmartPointerGraph);
register("trait-monomorphization", TraitMonomorphization);

// SUI — search / adversarial / CSP
import AstarExplorer from "./astar-explorer.jsx";
import MinimaxAlphaBeta from "./minimax-alphabeta.jsx";
import Mcts4Phase from "./mcts-4phase.jsx";
import CspAc3 from "./csp-ac3.jsx";
import CspBacktrackMrv from "./csp-backtrack-mrv.jsx";
import UninformedCompare from "./uninformed-compare.jsx";
import IddfsRedundancy from "./iddfs-redundancy.jsx";
import HillClimbingSa from "./hill-climbing-sa.jsx";
import NQueensMinConflicts from "./n-queens-min-conflicts.jsx";
import ExpectiminimaxDice from "./expectiminimax-dice.jsx";
import AndOrTreePlan from "./and-or-tree-plan.jsx";
import BeliefStateVacuum from "./belief-state-vacuum.jsx";
import AgentDecisionFlow from "./agent-decision-flow.jsx";

register("astar-explorer",          AstarExplorer);
register("minimax-alphabeta",       MinimaxAlphaBeta);
register("mcts-4phase",             Mcts4Phase);
register("csp-ac3",                 CspAc3);
register("csp-backtrack-mrv",       CspBacktrackMrv);
register("uninformed-compare",      UninformedCompare);
register("iddfs-redundancy",        IddfsRedundancy);
register("hill-climbing-sa",        HillClimbingSa);
register("n-queens-min-conflicts",  NQueensMinConflicts);
register("expectiminimax-dice",     ExpectiminimaxDice);
register("and-or-tree-plan",        AndOrTreePlan);
register("belief-state-vacuum",     BeliefStateVacuum);
register("agent-decision-flow",     AgentDecisionFlow);

// SUI — ML / NN / regression / classification
import BayesFromJoint from "./bayes-from-joint.jsx";
import LinearRegressionFit from "./linear-regression-fit.jsx";
import LogisticBoundary from "./logistic-boundary.jsx";
import GradientDescentBowl from "./gradient-descent-bowl.jsx";
import BackpropChain from "./backprop-chain.jsx";
import ActivationDerivatives from "./activation-derivatives.jsx";
import RegularizationL1L2 from "./regularization-l1-l2.jsx";
import VanishingGradientDepth from "./vanishing-gradient-depth.jsx";

register("bayes-from-joint",        BayesFromJoint);
register("linear-regression-fit",   LinearRegressionFit);
register("logistic-boundary",       LogisticBoundary);
register("gradient-descent-bowl",   GradientDescentBowl);
register("backprop-chain",          BackpropChain);
register("activation-derivatives",  ActivationDerivatives);
register("regularization-l1-l2",    RegularizationL1L2);
register("vanishing-gradient-depth", VanishingGradientDepth);

// SUI — CNN
import ConvolutionInteractive from "./convolution-interactive.jsx";
import CnnArchitecturesStack from "./cnn-architectures-stack.jsx";

register("convolution-interactive", ConvolutionInteractive);
register("cnn-architectures-stack", CnnArchitecturesStack);

// SUI — sekvence / jazyk
import AttentionHeatmap from "./attention-heatmap.jsx";
import TransformerBlockFlow from "./transformer-block-flow.jsx";
import RnnUnrollBptt from "./rnn-unroll-bptt.jsx";
import SoftmaxTemperature from "./softmax-temperature.jsx";
import Word2VecSkipgram from "./word2vec-skipgram.jsx";
import BertMlmFill from "./bert-mlm-fill.jsx";

register("attention-heatmap",       AttentionHeatmap);
register("transformer-block-flow",  TransformerBlockFlow);
register("rnn-unroll-bptt",         RnnUnrollBptt);
register("softmax-temperature",     SoftmaxTemperature);
register("word2vec-skipgram",       Word2VecSkipgram);
register("bert-mlm-fill",           BertMlmFill);

// SUI — RL
import QLearningGridworld from "./q-learning-gridworld.jsx";
import PolicyGradientCartpole from "./policy-gradient-cartpole.jsx";
import RlhfPipelineTrace from "./rlhf-pipeline-trace.jsx";

register("q-learning-gridworld",    QLearningGridworld);
register("policy-gradient-cartpole",PolicyGradientCartpole);
register("rlhf-pipeline-trace",     RlhfPipelineTrace);

// MSP — Probability fundamentals
import DistributionGallery from "./distribution-gallery.jsx";
import PdfCdfLink from "./pdf-cdf-link.jsx";
import CltSamplingConverge from "./clt-sampling-converge.jsx";
import SampleSpaceEvents from "./sample-space-events.jsx";
import LawOfLargeNumbers from "./law-of-large-numbers.jsx";

register("distribution-gallery",    DistributionGallery);
register("pdf-cdf-link",            PdfCdfLink);
register("clt-sampling-converge",   CltSamplingConverge);
register("sample-space-events",     SampleSpaceEvents);
register("law-of-large-numbers",    LawOfLargeNumbers);

// MSP — Estimation
import MleLikelihoodCurve from "./mle-likelihood-curve.jsx";
import BayesianUpdateBeta from "./bayesian-update-beta.jsx";
import FisherInfoCurvature from "./fisher-info-curvature.jsx";
import MomVsMleGamma from "./mom-vs-mle-gamma.jsx";
import BiasVarianceMse from "./bias-variance-mse.jsx";
import ExponentialFamilyCanonical from "./exponential-family-canonical.jsx";
import SufficientStatisticCompress from "./sufficient-statistic-compress.jsx";

register("mle-likelihood-curve",    MleLikelihoodCurve);
register("bayesian-update-beta",    BayesianUpdateBeta);
register("fisher-info-curvature",   FisherInfoCurvature);
register("mom-vs-mle-gamma",        MomVsMleGamma);
register("bias-variance-mse",       BiasVarianceMse);
register("exponential-family-canonical", ExponentialFamilyCanonical);
register("sufficient-statistic-compress", SufficientStatisticCompress);

// MSP — Inference & testing
import HypothesisTestTradeoff from "./hypothesis-test-tradeoff.jsx";
import CiRepeatedSampling from "./ci-repeated-sampling.jsx";
import TTestInteractive from "./t-test-interactive.jsx";
import ChisqTFGallery from "./chisq-t-f-gallery.jsx";
import LrWaldScoreTests from "./lr-wald-score-tests.jsx";
import QqPlotInteractive from "./qq-plot-interactive.jsx";
import ContingencyChisq from "./contingency-chisq.jsx";
import RankTestMechanics from "./rank-test-mechanics.jsx";

register("hypothesis-test-tradeoff", HypothesisTestTradeoff);
register("ci-repeated-sampling",    CiRepeatedSampling);
register("t-test-interactive",      TTestInteractive);
register("chisq-t-f-gallery",       ChisqTFGallery);
register("lr-wald-score-tests",     LrWaldScoreTests);
register("qq-plot-interactive",     QqPlotInteractive);
register("contingency-chisq",       ContingencyChisq);
register("rank-test-mechanics",     RankTestMechanics);

// MSP — Linear model & ANOVA
import AnovaInteractive from "./anova-interactive.jsx";
import AnovaInteractionPlot from "./anova-interaction-plot.jsx";
import GaussMarkovBlueDemo from "./gauss-markov-blue-demo.jsx";
import HatMatrixProjection from "./hat-matrix-projection.jsx";

register("anova-interactive",       AnovaInteractive);
register("anova-interaction-plot",  AnovaInteractionPlot);
register("gauss-markov-blue-demo",  GaussMarkovBlueDemo);
register("hat-matrix-projection",   HatMatrixProjection);

// MSP — Linear regression
import RegressionInteractive from "./regression-interactive.jsx";
import ResidualDiagnostics from "./residual-diagnostics.jsx";
import R2AdjustedOverfit from "./r2-adjusted-overfit.jsx";
import PredictionVsConfidenceBand from "./prediction-vs-confidence-band.jsx";

register("regression-interactive",  RegressionInteractive);
register("residual-diagnostics",    ResidualDiagnostics);
register("r2-adjusted-overfit",     R2AdjustedOverfit);
register("prediction-vs-confidence-band", PredictionVsConfidenceBand);

// MSP — Markov chains
import DtmcSimulator from "./dtmc-simulator.jsx";
import StationaryPowerIteration from "./stationary-power-iteration.jsx";
import ReachabilityFixpoint from "./reachability-fixpoint.jsx";
import McClassification from "./mc-classification.jsx";

register("dtmc-simulator",          DtmcSimulator);
register("stationary-power-iteration", StationaryPowerIteration);
register("reachability-fixpoint",   ReachabilityFixpoint);
register("mc-classification",       McClassification);

// MSP — MDP
import MdpGridworldPolicy from "./mdp-gridworld-policy.jsx";
import ValueIterationConverge from "./value-iteration-converge.jsx";

register("mdp-gridworld-policy",    MdpGridworldPolicy);
register("value-iteration-converge", ValueIterationConverge);

// MSP — Randomized
import QuicksortSimulation from "./quicksort-simulation.jsx";
import KargerContractionAnim from "./karger-contraction-anim.jsx";
import LasVegasVsMc from "./las-vegas-vs-mc.jsx";

register("quicksort-simulation",    QuicksortSimulation);
register("karger-contraction-anim", KargerContractionAnim);
register("las-vegas-vs-mc",         LasVegasVsMc);

// UPA — EDA & data prep
import DistributionExplorer from "./distribution-explorer.jsx";
import AnscombeAndCorrelation from "./anscombe-and-correlation.jsx";
import BinningAndOutlierRules from "./binning-and-outlier-rules.jsx";
import SmoteAndThresholdTuning from "./smote-and-threshold-tuning.jsx";
import ScalerComparator from "./scaler-comparator.jsx";
import PcaProjection from "./pca-projection.jsx";

register("distribution-explorer",       DistributionExplorer);
register("anscombe-and-correlation",    AnscombeAndCorrelation);
register("binning-and-outlier-rules",   BinningAndOutlierRules);
register("smote-and-threshold-tuning",  SmoteAndThresholdTuning);
register("scaler-comparator",           ScalerComparator);
register("pca-projection",              PcaProjection);

// UPA — distributed systems & query plumbing
import MapreduceShuffle from "./mapreduce-shuffle.jsx";
import ConsistentHashingRing from "./consistent-hashing-ring.jsx";
import SparqlGraphMatcher from "./sparql-graph-matcher.jsx";

register("mapreduce-shuffle",       MapreduceShuffle);
register("consistent-hashing-ring", ConsistentHashingRing);
register("sparql-graph-matcher",    SparqlGraphMatcher);

// UPA — spatial indexes
import MbbFilterRefine from "./mbb-filter-refine.jsx";
import KdTreeBuilder from "./kd-tree-builder.jsx";
import RtreeInsertSplit from "./rtree-insert-split.jsx";

register("mbb-filter-refine",   MbbFilterRefine);
register("kd-tree-builder",     KdTreeBuilder);
register("rtree-insert-split",  RtreeInsertSplit);

// UPA — semantic & DOM
import RdfsInference from "./rdfs-inference.jsx";
import CssXpathPlayground from "./css-xpath-playground.jsx";

register("rdfs-inference",      RdfsInference);
register("css-xpath-playground", CssXpathPlayground);

// UPA — column-store internals
import RowVsColumnScan from "./row-vs-column-scan.jsx";
import DictionaryEncodingBuilder from "./dictionary-encoding-builder.jsx";
import ColumnCompressionTechniques from "./column-compression-techniques.jsx";

register("row-vs-column-scan",           RowVsColumnScan);
register("dictionary-encoding-builder",  DictionaryEncodingBuilder);
register("column-compression-techniques", ColumnCompressionTechniques);

// UPA — Tier 2
import EventualConsistencyTimeline from "./eventual-consistency-timeline.jsx";
import CapPartitionSim from "./cap-partition-sim.jsx";
import RaftLeaderElection from "./raft-leader-election.jsx";
import RdfGraphBrowser from "./rdf-graph-browser.jsx";
import RdfFormatSwitcher from "./rdf-format-switcher.jsx";
import MainDeltaMergeTimeline from "./main-delta-merge-timeline.jsx";

register("eventual-consistency-timeline", EventualConsistencyTimeline);
register("cap-partition-sim",             CapPartitionSim);
register("raft-leader-election",          RaftLeaderElection);
register("rdf-graph-browser",             RdfGraphBrowser);
register("rdf-format-switcher",           RdfFormatSwitcher);
register("main-delta-merge-timeline",     MainDeltaMergeTimeline);

// AVS — pipeline + cache
import PipelineHazards from "./pipeline-hazards.jsx";
import CacheMapping from "./cache-mapping.jsx";

register("pipeline-hazards", PipelineHazards);
register("cache-mapping",    CacheMapping);

// AVS — pipelining + branch prediction (Tier 1)
import PipelineStageTracker from "./pipeline-stage-tracker.jsx";
import SuperpipeliningDepth from "./superpipelining-depth.jsx";
import ControlHazardRecovery from "./control-hazard-recovery.jsx";
import Branch2bitCounter from "./branch-2bit-counter.jsx";
import GshareCorrelatedBranches from "./gshare-correlated-branches.jsx";
import BtbRasTraversal from "./btb-ras-traversal.jsx";
import StridePrefetcherTrace from "./stride-prefetcher-trace.jsx";

register("pipeline-stage-tracker",     PipelineStageTracker);
register("superpipelining-depth",      SuperpipeliningDepth);
register("control-hazard-recovery",    ControlHazardRecovery);
register("branch-2bit-counter",        Branch2bitCounter);
register("gshare-correlated-branches", GshareCorrelatedBranches);
register("btb-ras-traversal",          BtbRasTraversal);
register("stride-prefetcher-trace",    StridePrefetcherTrace);

// AVS — superscalar + OoO (Tier 1)
import ScoreboardTrace from "./scoreboard-trace.jsx";
import TomasuloRsCdb from "./tomasulo-rs-cdb.jsx";
import RobPreciseExceptions from "./rob-precise-exceptions.jsx";

register("scoreboard-trace",       ScoreboardTrace);
register("tomasulo-rs-cdb",        TomasuloRsCdb);
register("rob-precise-exceptions", RobPreciseExceptions);

// AVS — cache + coherence (Tier 1)
import MesiStateMachine from "./mesi-state-machine.jsx";
import FalseSharingPingpong from "./false-sharing-pingpong.jsx";
import ReplacementPolicyRace from "./replacement-policy-race.jsx";

register("mesi-state-machine",     MesiStateMachine);
register("false-sharing-pingpong", FalseSharingPingpong);
register("replacement-policy-race", ReplacementPolicyRace);

// AVS — SIMD + GPU (Tier 1)
import SimdLaneExplorer from "./simd-lane-explorer.jsx";
import AutoVectorizationTracer from "./auto-vectorization-tracer.jsx";
import GpuWarpDivergence from "./gpu-warp-divergence.jsx";
import MemoryCoalescingPattern from "./memory-coalescing-pattern.jsx";

register("simd-lane-explorer",        SimdLaneExplorer);
register("auto-vectorization-tracer", AutoVectorizationTracer);
register("gpu-warp-divergence",       GpuWarpDivergence);
register("memory-coalescing-pattern", MemoryCoalescingPattern);

// AVS — Tier 2
import AmatCacheCalculator from "./amat-cache-calculator.jsx";
import NumaLatencyMap from "./numa-latency-map.jsx";
import OmpSchedulingComparator from "./omp-scheduling-comparator.jsx";
import OpenmpForkJoin from "./openmp-fork-join.jsx";
import SmtPipelineMixing from "./smt-pipeline-mixing.jsx";
import DvfsPstateCstateTimeline from "./dvfs-pstate-cstate-timeline.jsx";
import BankConflictWarp from "./bank-conflict-warp.jsx";

register("amat-cache-calculator",     AmatCacheCalculator);
register("numa-latency-map",          NumaLatencyMap);
register("omp-scheduling-comparator", OmpSchedulingComparator);
register("openmp-fork-join",          OpenmpForkJoin);
register("smt-pipeline-mixing",       SmtPipelineMixing);
register("dvfs-pstate-cstate-timeline", DvfsPstateCstateTimeline);
register("bank-conflict-warp",        BankConflictWarp);

// BIS — intro + incident + risk (Tier 1 + 2)
import KillChainDefender from "./kill-chain-defender.jsx";
import AttackTreeTraversal from "./attack-tree-traversal.jsx";
import RiskMatrixAle from "./risk-matrix-ale.jsx";

register("kill-chain-defender",   KillChainDefender);
register("attack-tree-traversal", AttackTreeTraversal);
register("risk-matrix-ale",       RiskMatrixAle);

// BIS — access control (Tier 1)
import BlpAccessChecker from "./blp-access-checker.jsx";
import RbacAbacEvaluator from "./rbac-abac-evaluator.jsx";

register("blp-access-checker",   BlpAccessChecker);
register("rbac-abac-evaluator",  RbacAbacEvaluator);

// BIS — SW vulnerabilities (Tier 1 + 2)
import StackBofVisualizer from "./stack-bof-visualizer.jsx";
import SqliInjectionTrace from "./sqli-injection-trace.jsx";
import ToctouTimeline from "./toctou-timeline.jsx";
import SpectreCacheTiming from "./spectre-cache-timing.jsx";
import RowhammerFlip from "./rowhammer-flip.jsx";
import CsrfSamesite from "./csrf-samesite.jsx";
import PhishingIndicators from "./phishing-indicators.jsx";

register("stack-bof-visualizer", StackBofVisualizer);
register("sqli-injection-trace", SqliInjectionTrace);
register("toctou-timeline",      ToctouTimeline);
register("spectre-cache-timing", SpectreCacheTiming);
register("rowhammer-flip",       RowhammerFlip);
register("csrf-samesite",        CsrfSamesite);
register("phishing-indicators",  PhishingIndicators);

// BIS — network defenses (Tier 1)
import FirewallStatefulTrace from "./firewall-stateful-trace.jsx";
import IdsRocTuner from "./ids-roc-tuner.jsx";
import ArpPoisonMitm from "./arp-poison-mitm.jsx";
import DdosAmplification from "./ddos-amplification.jsx";

register("firewall-stateful-trace", FirewallStatefulTrace);
register("ids-roc-tuner",           IdsRocTuner);
register("arp-poison-mitm",         ArpPoisonMitm);
register("ddos-amplification",      DdosAmplification);

// BIS — WiFi (Tier 1 + 2)
import Wpa2HandshakeKrack from "./wpa2-handshake-krack.jsx";
import WepFmsCracker from "./wep-fms-cracker.jsx";
import Wpa3SaeVsPskBrute from "./wpa3-sae-vs-psk-brute.jsx";

register("wpa2-handshake-krack",   Wpa2HandshakeKrack);
register("wep-fms-cracker",        WepFmsCracker);
register("wpa3-sae-vs-psk-brute",  Wpa3SaeVsPskBrute);

// BIS — SecOps + policy + standards (Tier 1 + 2)
import SiemCorrelationTrace from "./siem-correlation-trace.jsx";
import IrTimelineMetrics from "./ir-timeline-metrics.jsx";
import GdprRightsFlow from "./gdpr-rights-flow.jsx";
import PdcaIsms from "./pdca-isms.jsx";
import CcEalExplorer from "./cc-eal-explorer.jsx";

register("siem-correlation-trace", SiemCorrelationTrace);
register("ir-timeline-metrics",    IrTimelineMetrics);
register("gdpr-rights-flow",       GdprRightsFlow);
register("pdca-isms",              PdcaIsms);
register("cc-eal-explorer",        CcEalExplorer);
