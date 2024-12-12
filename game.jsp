<%@ page import="seldon.main.DBHandler" %>
<%@ page import="net.boardgamecore.contract.user.User" %>
<%@ page import="seldon.main.Main" %>
<%@ page import="net.boardgamecore.games.GenericGameManager" %>
<%@ page import="net.boardgamecore.type.GenericGame" %>
<%
    User user = (User) session.getAttribute("user");
    if (user == null) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (int i = 0 ; i < cookies.length ; i++) {
                if ("sessionId".equals(cookies[i].getName())) {
                    try {
                        user = Main.getInstance().getUserBySessionId(cookies[i].getValue());
                    } catch (NullPointerException e) {
                        user = null;
                    }
                    if (user != null) session.setAttribute("user", user);
                    break;
                }
            }
        }
    }

    int version = 20170906;

%>
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Wir Sind Das Volk !</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="stylesheet" href="css/normalize.css">
        <link rel="stylesheet" href="css/main.css?v=<%= version %>">
        <link rel="icon" type="image/png" href="../favicon.png?v=<%= version %>" />
    </head>
    <body>
        
	<jsp:include page="../header.jsp"></jsp:include>
        <div>
            <div class="board" id="board"><img src="img/map.jpg"/><div id="linesmagnifier"></div></div>
            <div class="aire">
                <div id="workflow"></div>
                <div id="newruleswarning">Warning ! Official rule change ! <a href="javascript:$('#warningPopin').show()">Click here</a></div>
                <div id="bugEntry" class="zoneText">
                    <p>Describe the problem you are currently facing. If you can continue, feel free to do it, because the game will be stored for inspection in the current state</p>
                    <div class="control">
                        <textarea id="bugDescription"></textarea>
                        <button>Log it</button>
                    </div>
                </div>
                <div id="west" class="player west"></div>
                <div id="east" class="player east"></div>
                <div id="chat" class="zoneText">
                    <div class="control">
                        <textarea id="chatMessage"></textarea>
                        <button onclick="addMessage()">Post</button>
                        <button onclick="viewFullChat()" id="toggleChatButton">Toggle Chat</button>
                    </div>
                    <div id="messageList">

                    </div>
                </div>
                <div id="cardrow"></div>
                <div id="cardpopin"></div>
                <div id="actiondetail"></div>
                <div id="guillaumeaffairehelp">Guillaume-Affair. East may examine either the West hand of cards or the 2 top cards of the draw deck. East may then exchange 1 of its cards for one of these. Alternatively, if East examines the 2 top cards of the draw deck, it may remove 1 of those cards from the game. </div>
                <div id="attack"></div>
                <div>
                    <h3>Game log</h3>
                    <div id="history"></div>
                </div>
            </div>
        </div>

        <div id="warningPopin">
            <div>

                <h1>New Rules !</h1>
                <p>Official rules modification : </p>
                <div>
                    <ul>
                        <li>East starts with 1 socialist cube instead of 2</li>
                        <li>Each West supplier province starts with 2 unrest cubes instead of 3 (Nordrhein-Westfalen, Baden-Württemberg, Rheinland-Pfalz)</li>
                        <li>When East plays its special card (e.g. Russian tanks), it must choose to : 
                            <ul>
                                <li>discard one of its hand card, or</li>
                                <li>let West pick the top card of the draw deck (so that West receives an additional handcard). West cannot keep more than 2 cards in hand from one decade to another</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <p>Check the <a href="https://boardgamegeek.com/thread/1509731/rules-changes-version-20-online-now">boardgamegeek thread</a>.</p>
                <p>These rules will apply to all games started after <%= Main.wsdvSwitchStr %>.</p>
                <p class="center"><button onclick="$('#warningPopin').hide()">Close</button></p>
            </div>
        </div>

        <div id="credits">

            <button onclick="$('#credits').hide()">Close</button>
            <h2>BILDNACHWEIS</h2>
            <p>Die Bildrechte des originalen Bildmaterials (Fotos), aus dem die jeweilige Grafik der folgenden Spielkarten (Bildseite) als grafische Bearbeitung entstand, liegen bei:</p>

            <ul>
            <li/>Nr. I: Katrin Reichelt
            <li/>Nr. II: Bundesarchiv, Bild 183-88574-0004 / Stöhr / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. III: Bundesarchiv, Bild 183-K0616-0001-125 / Koard, Peter / CC BY-SA, lizenziert unter CC BY-SA 3.0 DE
            <li/>Nr. IV (Mauerfall-Seite) Lear 21 at en.wikipedia, Wikimedia Commons, Lizenz: CC BY-SA 3.0 ; (andere Seite) Bundesarchiv, Bild 183-1989-1203-010 / CC BY-SA, lizenziert unter CC BY-SA 3.0 DE
            <li/>Nr. 1: Bundesarchiv, Bild 183-T0802-505 / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 2: Deutsche Fotothek, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 4: wiki-user GFHund (Gerhard Hund; Foto aus Nachlaß von Friedrich Hund); Lizenz: CC-BY-SA 3.0)
            <li/>Nr. 5: Collage aus: Bundesarchiv, Bild 175-04246 / CC BY-SA, Lizenz: CC BY-SA 3.0 DE & Rob H, Wikimedia Commons, Lizenz: CC BY-SA 3.0 & Roi Boshi, Wikimedia Commons, gemeinfrei
            <li/>Nr. 7: Collage aus Fotos von Bernd Hübner & Richard Shako
            <li/> Nr. 8: (Der Saarfranken) Roger Zenner, Lizenz: CC BY-SA 2.0 DE
            <li/>Nr. 15: Bundesarchiv, Bild 183-14812-007 / Quaschinsky, HansGünter / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 16: Schautafel Nr. 12, Karl-Marx-Allee 103, 10243 Berlin, Fotograf und Rechteinhaber sind nicht genannt; Panoramafreiheit
            <li/>Nr. 17: Bundesarchiv, Bild183-S79103 / Heinscher / CC BY-SA, Heinscher, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 18: Baschti23 aus der deutschsprachigen Wikipedia, Wikimedia Commons, Lizenz: CC BY-SA 3.0
            <li/>Nr. 21: Collage aus freier Zeichung und 2 Fotos (Bundesarchiv, Bild 183-76791-0009 / Sturm, Horst / CC BY-SA, lizenziert unter CC BY-SA 3.0 DE & Christoph Andreas)
            <li/>Nr. 22: Bundesarchiv, Bild 183-C1106-0047-001 / Hesse, Rudolf / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 23: Bundesarchiv, Bild 183-B0115-0010-026 / Junge, Peter Heinz / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 27: Bundesarchiv, Bild 183-E0506-0004-001 / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 30: Nstannik, Wikimedia Commons, lizenziert unter CC BYSA 3.0
            <li/>Nr. 31: Bundesarchiv, Bild 183-G1009-0202-019 / Koch, Heinz / CC BY-SA, lizenziert unter CC BY-SA 3.0 DE
            <li/>Nr. 33: Holger.Ellgaard, Wikimedia Commons, Lizenz: CC BY 3.0
            <li/>Nr. 34: Bundesarchiv, Bild 183-1985-0118-035 / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 36: Bundesarchiv, B 145 Bild-F030053-0030 / Gathmann, Jens / CC BY-SA, lizenziert unter CC BY-SA 3.0 DE
            <li/>Nr. 41: Elkawe, Wikimedia Commons, Lizenz: CC BY 3.0
            <li/>Nr. 42: Collage aus freier Zeichnung und Foto (Bundesarchiv, B 145 Bild-F042658-0032 / Wienke, Ulrich / CC BY-SA, lizenziert unter CC BY-SA 3.0 DE)
            <li/>Nr. 43: Bundesarchiv, B 145 Bild-F079044-0020 / CC BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 45: Deutsche Fotothek, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 46: Istvan, Wikimedia Commons, Lizenz: CC BY-SA 3.0
            <li/>Nr. 49: Pudelek (Marcin Szala), Wikimedia Commons, Lizenz: CC BY-SA 3.0
            <li/>Nr. 50: Pelz, Wikimedia Commons, Lizenz: CC BY-SA 3.0
            <li/>Nr. 51: ChrisO, Wikimedia Commons, Lizenz: CC BY-SA 3.0
            <li/>Nr. 52: &copy; Raimond Spekking / CC BY-SA-4.0 (via Wikimedia Commons), lizenziert unter CC BY-SA 4.0
            <li/>Nr. 56: Rudolf Stricker, Wikimedia Commons, Namensnennung erforderlich
            <li/>Nr. 57: Christoph Andreas
            <li/>Nr. 59: Collage aus Fotos von Bernd Hübner
            <li/>Nr. 61: Collage aus Fotos von: Neptuul, Wikimedia Commons, Lizenz: CC BY-SA 3.0 & SpreeTom, Wikimedia Commons, Lizenz: CC BY-SA 3.0
            <li/>Nr. 62: bdk, Wikimedia Commons, Lizenz: CC BY-SA 2.0
            <li/>Nr. 64: Bundesarchiv, Bild 183-1990-0226-315 / Mittelstädt, Rainer / CC-BY-SA, lizenziert unter CC BY-SA 3.0 DE
            <li/>Nr. 65: Bundesarchiv, Bild 183-1987-0907-13 / CC-BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 66: DDR Museum, 10178 Berlin
            <li/>Nr. 67: avda, Wikimedia Commons, Lizenz: CC BY-SA 3.0
            <li/>Nr. 68: Foto: Christoph Rau (www.christoph-rau.de)
            <li/>Nr. 70: Eva K. (Eva Kröcher), Wikimedia Commons, Lizenz: CC BY-SA 2.5
            <li/>Nr. 71: Bundesarchiv, Bild 183-1989-1207-006 / Häßler, Ulrich / CC-BY-SA, lizenziert unter CC BY-SA 3.0 DE
            <li/>Nr. 73: Collage aus Fotos von: Arek1979, Wikimedia Commons, Lizenz: CC BY-SA 3.0 & Andrzej Iwa ´nski, Wikimedia Commons Lizenz: CC BY-SA 3.0 & Piotr VaGla Waglowski, http://www.vagla.pl, Wikimedia Commons, gemeinfrei
            <li/>Nr. 77: Bundesarchiv, Bild 183-1990-0922-003 / CC-BY-SA, Lizenz: CC BY-SA 3.0 DE
            <li/>Nr. 78: Hans-Jürgen Röder
            <li/>Nr. 79: Bill Bertram, Wikimedia Commons, Lizenz: CC BY-SA 2.5
            <li/>Nr. 80: Foto AP, ullstein bild, Gedenktafel, Bornholmer Straße/Böse Brücke, 10439 Berlin; Panoramafreiheit
            </ul>

            <p>Zahlreiches Bildmaterial der obigen Liste steht unter einer Creative-Commons-Lizenz (CC-Lizenz) (z.B. Karte Nr. 1 unter der Lizenz CC BY-SA 3.0 DE). Für all dieses Bildmaterial sei noch einmal explizit betont: Die Grafiken der Spielkarten sind eine (meist
            starke bis sehr starke) Bearbeitung des originalen Fotos. Ferner gilt: 	Wenn ein Foto der obigen Liste unter einer Lizenz vom Typ "sharealike" (SA) steht, so steht die Grafik der Karte unter genau derselben Lizenz. 	(Bei einer Verwendung ist folgende Namensnennung anzugeben:
            "&copy; 2014, Richard Shako, Histogame, www.histogame.de, Karte Nr. xx des Brettspiels WIR SIND DAS VOLK!" (wobei für xx die entsprechende Kartennummer einzusetzen ist)).</p>

            <p>Die Links zu Lizenzen in obiger Liste sind:</p>
            <ul>
                <li/>CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/legalcode
                <li/>CC BY-SA 3.0 DE: https://creativecommons.org/licenses/by-sa/3.0/de/legalcode
                <li/>CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/legalcode
                <li/>CC BY 3.0: https://creativecommons.org/licenses/by/3.0/legalcode
                <li/>CC BY-SA 2.5: https://creativecommons.org/licenses/by-sa/2.5/legalcode
                <li/>CC BY-SA 2.0 DE: https://creativecommons.org/licenses/by-sa/2.0/de/legalcode
                <li/>CC BY-SA 2.0: https://creativecommons.org/licenses/by-sa/2.0/legalcode
            </ul>

            <p>Ferner wurde Bildmaterial in bearbeiteter Form verwendet für:<p/>
            <ul>
                <li/>Guillaume-Affäre-Symbol:Foto, Pelz, Wikimedia Commons, Lizenz: CC BY-SA 3.0
                <li/>Betonhintergrund (Spielplan, Kartenrückseiten, Schachtelrückseite):Learning Object Online Platform, Fachhochschule Lübeck, 	http://loop.oncampus.de, Lizenz: CC BY-SA 3.0
                <li/>Kopf des Sozialistensymbols: Foto, Bundesarchiv, Bild 102-12940 / CC-BY-SA, Lizenz: CC BY-SA 3.0 DE
            </ul>

            <p>Obige Ausführungen zu den Rechten, der Möglichkeit zur Weiterverwendung und die Links zu den Lizenzen gelten auch hier.</p>

            <p>Alle anderen Grafiken (Spielkarten, Spielplan, etc.) sind entweder freie Zeichnungen, Collagen, Freie Benutzungen, Bearbeitungen eigenen Bildmaterials oder Bearbeitungen gemeinfreier Vorlagen.</p>

        </div>


        <script>
            var NEWRULES_TS = <%= Main.wsdvSwitchTimestamp %>;
            
            <%
                int gameId = -1;
                GenericGame game = null;
                try {
                    gameId = Integer.parseInt(request.getParameter("g"));
                    game = GenericGameManager.getInstance().getGame(gameId);
                } catch (Exception e ) {
                    e.printStackTrace();
                }

                if (game != null) {
                %>

                var global = {};

                <%
                    String model = DBHandler.getInstance().getAntiquityGame(gameId);
                    String westPlayer = game.getPlayers().get(0);
                    String eastPlayer = game.getPlayers().get(1);

                    if (user != null && game != null &&  GenericGameManager.belongToTheGame(user, game)) {
                        int pov = 3;
                        if (user.getName().equals(game.getPlayers().get(0))) {
                            pov = 1;
                        } else if (user.getName().equals(game.getPlayers().get(1))) {
                            pov = 2;
                        }
                %>

                global.pov = <%= pov %>;
                <%
                    }
                %>
                global.gameId = <%= gameId %>;
                global.creationdate = <%= game.getStartingDate() %>;
                global.name = '<%= user != null ? user.getName() : "Anonymous" %>';

                <% if (user == null) {%>
                global.termidor = true;
                <% } %>

                <% if (model == null && !"waiting".equals(game.getStatus())) {
                %>
                global.west = '<%= westPlayer%>';
                global.east = '<%= eastPlayer%>';
                <%
                } else {
                %>
                global.load = <%= model %>;
                <%
                }
                %>
                global.now = <%= System.currentTimeMillis() %>;
            <%}%>

        </script>

        <script src="js/vendor/zepto.min.js"></script>
        <script src="js/vendor/lodash.min.js"></script>
        <script src="js/vendor/firebase.js"></script>
        <script src="js/reference.js?v=<%= version %>"></script>
        <script src="js/model.js?v=<%= version %>"></script>
        <script src="js/view.js?v=<%= version %>"></script>
        <script src="js/history.js?v=<%= version %>"></script>
        <script src="js/rules.js?v=<%= version %>"></script>
        <script src="js/controller.js?v=<%= version %>"></script>
        <script src="js/io.js?v=<%= version %>"></script>
        <script src="js/main.js?v=<%= version %>"></script>

    </body>
</html>
