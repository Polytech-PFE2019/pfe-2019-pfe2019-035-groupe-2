package acmgatewaysrv;

import agg.cons.AtomConstraint;
import agg.util.Pair;
import agg.xt_basis.*;

import java.util.Arrays;
import java.util.List;
import java.util.Vector;

public class AGGRunner {

    private static GraGra graphGrammar;
    private static GraGra ruleGrammar;
    private final MorphCompletionStrategy strategy = CompletionStrategySelector.getDefault();

    private static final Boolean DEBUG = false;

    public AGGRunner(String filename) throws Exception {
        BaseFactory bf = BaseFactory.theFactory();
        graphGrammar = bf.createGraGra();
        graphGrammar.load(filename);
        /*
        ruleGrammar = bf.createGraGra();
        ruleGrammar.load("test1.ggx");
        */
        ruleGrammar = graphGrammar;
        graphGrammarTransform(filename);
    }

    public static void showGraph(GraGra gragra) {
        /*System.out.println("\nGraph: " + gragra.getGraph().getName() + " {");
        Iterator<?> e = gragra.getGraph().getArcsSet().iterator();
        while (e.hasNext()) {
            Arc arc = (Arc) e.next();
            Node src = (Node) arc.getSource();
            Node trg = (Node) arc.getTarget();
            System.out.println(src.getAttribute().getValueAt("name") + " ---"
                    + arc.getType().getStringRepr() + "---> "
                    + trg.getAttribute().getValueAt("name"));
        }
        e = gragra.getGraph().getNodesSet().iterator();
        while (e.hasNext()) {
            Node node = (Node) e.next();
            if (node.getIncomingArcsSet().isEmpty()
                    && node.getOutgoingArcsSet().isEmpty())
                System.out.println(node.getAttribute().getValueAt("name"));
        }
        System.out.println(" }\n");*/
    }

    private void graphGrammarTransform(String filename) {
        Pair<Object, String> pair = graphGrammar.isReadyToTransform(true);
        Object test = null;
        if (pair != null)
            test = pair.first;
        if (test != null) {
            if (test instanceof Graph) {
                System.out.println("Grammar  " + graphGrammar.getName()
                        + "  graph: " + graphGrammar.getGraph().getName()
                        + "  is not ready for transform");
            } else if (test instanceof AtomConstraint) {
                String s0 = "Atomic graph constraint  \""
                        + ((AtomConstraint) test).getAtomicName()
                        + "\" is not valid. "
                        + "\nPlease check: "
                        + "\n  - graph morphism ( injective and total )  "
                        + "\n  - attribute context ( variable and condition declarations ).";
                System.out.println(s0);
            } else if (test instanceof Rule) {
                String s0 = "Rule  \""
                        + ((Rule) test).getName()
                        + "\" : "
                        + ((Rule) test).getErrorMsg()
                        + "\nPlease check: \n  - attribute settings of the new objects of the RHS \n  - attribute context ( variable and condition declarations ) of this rule.\nThe grammar is not ready to transform.";
                System.out.println(s0);
            }
            System.out.println("Grammar  " + graphGrammar.getName()
                    + "  CANNOT TRANSFORM!");
            return;
        }
        if(DEBUG) {
            System.out.println("Grammar  " + graphGrammar.getName() + "  is ready to transform");
            System.out.println("Matching and graph transformation ");
        }

        // Get all completion strategies
        // Enumeration<MorphCompletionStrategy> strategies = CompletionStrategySelector.getStrategies();

        // default strategy is injective, with dangling condition (DPO), with
        // NACs.
        if(DEBUG) {
            System.out.println(this.strategy);
            this.strategy.showProperties();
        }

        /* an example to set / clear strategy properties */
        /*
         * BitSet activebits = strategy.getProperties();
         * activebits.clear(CompletionPropertyBits.INJECTIVE);
         * activebits.clear(CompletionPropertyBits.DANGLING);
         * activebits.clear(CompletionPropertyBits.IDENTIFICATION);
         * activebits.clear(CompletionPropertyBits.NAC);
         * System.out.println(strategy.getProperties());
         * strategy.showProperties();
         * activebits.set(CompletionPropertyBits.INJECTIVE);
         * activebits.set(CompletionPropertyBits.DANGLING); //
         * activebits.set(CompletionPropertyBits.IDENTIFICATION);
         * activebits.set(CompletionPropertyBits.NAC);
         * System.out.println(strategy.getProperties());
         * strategy.showProperties();
         */

        // Set graph transformation options
        Vector<String> gratraOptions = new Vector<String>();
        gratraOptions.add("CSP");
        gratraOptions.add("injective");
        gratraOptions.add("dangling");
        gratraOptions.add("NACs");
        gratraOptions.add("PACs");
        gratraOptions.add("GACs");
        gratraOptions.add("consistency");
        graphGrammar.setGraTraOptions(gratraOptions);

        // Set file name and save grammar
        String fn = filename + "-output.ggx";
        graphGrammar.save(fn);

        if(DEBUG) {
            System.out.println("Grammar " + graphGrammar.getName() + " saved in " + fn);
            System.out.println("Continue ...");
        }

        Match match = null;
/********************************************************************************************/
        // an example to applay a rule
        List<Rule> rules = graphGrammar.getListOfRules();

        boolean[] done = new boolean[rules.size()];
        Arrays.fill(done, true);
        for (int i = 0; i < rules.size(); i++) {
            // an example to apply rule2
            Rule rule2 = rules.get(i);

            if(DEBUG) {
                System.out.println("Apply  rule2  " + rule2.getName() + " so long as possible");
                System.out.println("Rule2  " + rule2.getName() + "    >> create match");
            }

            match = graphGrammar.createMatch(rule2);
            match.setCompletionStrategy(this.strategy, true);
            try {
                while (match.nextCompletion()) {
                    done[i] = false;
                    showGraph(graphGrammar);

                    /*
                     * test output of attribute conditions: ac =
                     * match.getAttrContext(); ContextView cv = (ContextView) ac;
                     * AttrConditionTuple condTuple = (AttrConditionTuple)
                     * cv.getConditions(); for (int i = 0; i <
                     * condTuple.getNumberOfEntries(); i++) { AttrConditionMember cm =
                     * (AttrConditionMember) condTuple.getMemberAt(i);
                     * System.out.println("Condition "+i+": name="+cm.getName()+"
                     * val="+cm.getExprAsText()); } System.out.println("Condition is
                     * satisfied :" + condTuple.isTrue());
                     */

                    /*
                     * test output of variables with its values for (int i = 0; i <
                     * ac.getVariables().getNumberOfEntries(); i++) { am =
                     * (AttrInstanceMember) ac.getVariables().getMemberAt(i);
                     * System.out.println("Variable "+i+": name="+am.getName()+"
                     * value="+am.getExprAsText()); }
                     */
                    if (DEBUG) {
                        System.out.println("Rule : match is complete");
                    }
                    if (match.isValid()) {
                        if (DEBUG) {
                            System.out.println("Rule :  match is valid");
                        }
//					Step step = new Step();
                        try {
                            StaticStep.execute(match);
                            if (DEBUG) {
                                System.out.println("Rule  " + match.getRule().getName() + " : step is done");
                            }
                        } catch (TypeException ex) {
                            ex.printStackTrace();
                            graphGrammar.destroyMatch(match);
                            if (DEBUG) {
                                System.out.println("Rule  " + match.getRule().getName() + " : match failed! " + ex.getMessage());
                            }
                        }
                    } else {
                        if (DEBUG) {
                            System.out.println("Rule  " + match.getRule().getName() + " : match is not valid");
                        }
                    }
                }
            } catch(Exception e){
                System.err.println("Exception processing some match; skipping it");
                //done[i] = true;
            }

            if(DEBUG) {
                System.out.println("Rule  " + match.getRule().getName()+ " : match has no more completion");
            }

            graphGrammar.destroyMatch(match);
            showGraph(graphGrammar);
            graphGrammar.save(fn);

            if(DEBUG) {
                System.out.println("After apply rule2  graphGrammar  saved in  " + fn);
            }

            // shitty looping
            if(i==rules.size()-1) {
                if(!doneDoingShit(done)){
                    i=-1;
                    Arrays.fill(done, true);
                }
            }
        }


        //Rule rule3 = rules.get(2);

        // Create a transformation unit

        // if you want to use rule layers (layered graph transformation)
        // add option "layered".
        gratraOptions.add("layered");
        graphGrammar.setGraTraOptions(gratraOptions);
        // Set layer : rule1 "NewPerson" layer 0
        // rule2 "SetRelation" layer 2
        // rule3 "RemoveRelation" layer 1

        //rule2.setLayer(2);
        //rule3.setLayer(1);
    }

    boolean doneDoingShit(boolean[] a){
        boolean ret = true;
        for(boolean ba : a){
            ret &= ba;
        }
        if(DEBUG) {
            System.out.println("AB");
            System.out.println(Arrays.toString(a));
            System.out.println(ret);
        }
        return ret;
    }
}
